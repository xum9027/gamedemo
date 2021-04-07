// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const  Input = {};
const  State = {
    stand:1,
    attack:2,
    jump:3,
    hurt:4,
    die:5,
    slide:6,
}

cc.Class({
    extends: cc.Component,

    properties: {
        _speed: {
            default: 200,
            type: cc.Integer,
            visible: true
        },
        _jspeed: {
            default: 200,
            type: cc.Integer,
            visible: true
        },
        hp: {
            default: 10,
            type: cc.Integer,
        },
    },

    onLoad () {
        this.isHit = false;
        this.sp = cc.v2(0,0);
        this.maxHp = this.hp;

        //英雄状态
        this.combo = 0;
        this.onGround = true;
        this.inSlide = false;

        this.heroState = State.stand;
        this.anima = 'idle';
        this.heroAni =this.node.getChildByName('body').getComponent(cc.Animation);
        this.heroHpbox =this.node.getChildByName('hero_hp').getComponent(cc.ProgressBar);
        this.attackBox = this.node.getChildByName('body').getComponent(cc.BoxCollider);
        this.rb = this.node.getComponent(cc.RigidBody);
        

        cc.systemEvent.on('keydown',this.onkeydown,this);
        cc.systemEvent.on('keyup',this.onkeyup,this);
        cc.director.getCollisionManager().enabled = true;

        this.hpNode  = this.node.getChildByName('hero_hp');
        this.dieNode = cc.find('Canvas/bg/die_label');

        this.heroAni.on('finished', (e, data) => {
            if(data.name == 'attack' || data.name == 'attack2'|| data.name == 'attack3'){           
                this.heroState = State.stand;
                this.combo = (this.combo + 1) % 3;
                setTimeout(() => {
                    if (this.heroState == State.attack) return;
                    this.combo = 0;
                },350)
            }
            if (data.name == 'hurt'){
                this.hp--;
                this.isHit = false;
                if(this.hp%(this.maxHp/10)==0)this.heroHpbox.progress -= 0.1;
                
                if(this.hp ==0){
                    this.die();
                }else{
                    this.heroState = State.stand;
                }
            }
            if (data.name == 'die') {   
                setTimeout(() => {
        
                    this.dieNode.active = true;
                },1000)
                   
            }
            if (data.name == 'slide') {   
                this.heroState = State.stand;
                this.isHit = false;
    
                this.lv.x = 0;
                this.lv = this.rb.linearVelocity;
                
                this.setAni('idle');
                setTimeout(() => {
                    this.inSlide = false;
                },3000)
            }
        });
    },

    onDestroy() {
        
        cc.systemEvent.off('keydown',this.onkeydown,this);
        cc.systemEvent.off('keyup',this.onkeyup,this);
    },

    

    setAni(anima){
        if(this.anima == anima) return;
        this.anima = anima ;
        this.heroAni.play(anima);
    },

    onkeydown (e) {
        Input[e.keyCode] =1;
    },

    onkeyup (e) {
        Input[e.keyCode] =0;
    },

    onCollisionEnter(other,self){
        if(other.node.group =='enemy' && other.tag ==2 && this.hp >0 ){ 
            if(other.size.width == 0 || other.size.height == 0)return;        
            this.hurt();
        }
    },
    
    onBeginContact(contact, selfCollider, otherCollider){
        if(otherCollider.node.group =='wall' && selfCollider.tag == 1 && !this.isHit && this.hp >0 && this.heroState != State.attack && !this.onGround){
            this.heroState = State.stand;
            this.setAni('idle');
            
            this.onGround =true;
        }
    },
   

    
    die() {
        this.setAni('die');

        this.lv = this.rb.linearVelocity;
        this.lv.x = 0;
        this.rb.linearVelocity = this.lv;

    },

    attack() {
        if (Input[cc.macro.KEY.j]) {
            switch (this.combo){
                case 0: this.setAni('attack');break;
                case 1: this.setAni('attack2');break;
                case 2: this.setAni('attack3');break;
            }
            this.lv.x = 0;
            this.lv.y = 0;
        }
        this.rb.linearVelocity = this.lv;
    },

    jump() {
        if (Input[cc.macro.KEY.k] ) {
            this.lv.x = 0;
            this.onGround= false;
            this.setAni('jump');
            this.sp.y = 1;
            this.lv.y = this.sp.y * this._jspeed;
            this.lv.x = this.sp.x * this._jspeed /2;
        }
        this.rb.linearVelocity = this.lv;      
    },

    circling() {
        let scaleX = Math.abs(this.node.scaleX);
        this.lv = this.rb.linearVelocity;

        if (Input[cc.macro.KEY.a] || Input[cc.macro.KEY.left]) {
            this.sp.x = -1;
            this.node.scaleX = -scaleX;
        }else if(Input[cc.macro.KEY.d] || Input[cc.macro.KEY.right]){
            this.sp.x = 1;
            this.node.scaleX = scaleX;
        }else{
            this.sp.x = 0;
        }
        if(this.sp.x){
            this.lv.x = this.sp.x * this._speed;
        }else{
            this.lv.x = 0;
        }
        this.rb.linearVelocity = this.lv;
    },

    move() {
        let anima = this.anima;
        let scaleX = Math.abs(this.node.scaleX);
        this.lv = this.rb.linearVelocity;
        //移动
        if (Input[cc.macro.KEY.a] || Input[cc.macro.KEY.left]) {
            this.sp.x = -1;
            this.node.scaleX = -scaleX;
            this.setAni('run');
        }else if(Input[cc.macro.KEY.d] || Input[cc.macro.KEY.right]){
            this.sp.x = 1;
            this.node.scaleX = scaleX;
            this.setAni('run');
        }else{
            this.sp.x = 0;
            this.setAni('idle');
        }
        if(this.sp.x){
            this.lv.x = this.sp.x * this._speed;
        }else{
            this.lv.x = 0;
        }
        
        this.rb.linearVelocity = this.lv;
    },

    slide() {
        if(Input[cc.macro.KEY.l]){
            if(this.inSlide)return;
            this.inSlide = true;
            this.isHit = true;
            this.sp.x = 0;
            let scaleX = Math.abs(this.node.scaleX);
            this.lv = this.rb.linearVelocity;
            if (Input[cc.macro.KEY.a] || Input[cc.macro.KEY.left]) {
                this.sp.x = -1;
                this.node.scaleX = -scaleX;
                this.setAni('slide');
            }else if(Input[cc.macro.KEY.d] || Input[cc.macro.KEY.right]){
                this.sp.x = 1;
                this.node.scaleX = scaleX;
                this.setAni('slide');
            }else{
                this.sp.x = 0;
                this.setAni('slide');
            }
            if(this.sp.x){
                this.lv.x = this.sp.x * this._speed *0.9;
            }else{
                this.lv.x = 0;
            }
            
            this.rb.linearVelocity = this.lv;
 
        }
    },

    hurt() {
        if (this.isHit)return;
        this.isHit = true;
        this.heroState = State.hurt;

        this.lv = this.rb.linearVelocity;
        this.lv.x = 0;
        this.lv.y = 0;
        this.rb.linearVelocity = this.lv;

        this.setAni('hurt');
    },

    update (dt) {     
        //切换状态
        if(this.heroState != State.die){
            switch(this.heroState) {
                case State.stand :{
                    if (Input[cc.macro.KEY.j]) {
                        this.heroState = State.attack;
                    }else if (Input[cc.macro.KEY.k] && this.onGround) {
                        this.heroState = State.jump;                 
                    }else if (Input[cc.macro.KEY.l] && !this.inSlide) {
                        if(this.inSlide)return;
                        this.heroState = State.slide;  
                    }
                    break;
                }
            } 
        }
        

        if (this.heroState == State.attack){
            this.attack();//攻击
        }else if (this.heroState == State.jump && this.onGround){
            this.jump();//跳跃
        }else if (this.heroState == State.stand){
            this.move();//移动  
        }
        else if (this.heroState == State.slide){
            this.slide();
        }
        if(!this.onGround && this.heroState!=State.die && this.heroState!=State.hurt){
            this.circling();//空中运动
        }

        if(this.heroState == State.attack){
            this.attackBox.enabled = true;
        }else{
            this.attackBox.enabled = false;
        }
        
        
        
    },
});
