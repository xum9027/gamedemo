// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
const  State = {
    stand:1,
    attack:2,
    hurt:3,
    die:4,
}
cc.Class({
    extends: cc.Component,

    properties: {

    },


    onLoad () {
        this.hp = 5;
        this.isHit = false;
        this.anima = 'idle';
        this.ani =this.node.getChildByName('body').getComponent(cc.Animation);
        this.rb = this.node.getComponent(cc.RigidBody);

        this._speed =40;
        this.sp = cc.v2(0,0);
        this.tt = 0;
        
        this.enemyState = State.stand;

        this.ani.on('finished', (e, data) => {
            if (data.name == 'hurt'){
                this.hp--;
                this.isHit = false;

                if(this.hp ==0){
                    this.die();
                }else{
                    this.enemyState = State.stand;
                }
            }else if (data.name == 'attack') {
                this.setAni('idle');
                this.enemyState = State.stand;
            }else if (data.name == 'die') {
                
                this.node.destroy();
            }
        });

        this.moveLeft = false;
        this.moveRight = false;

        //左右移动
        // setInterval(() => {
        //     this.moveLeft = !this.moveLeft;
        //     this.moveRight = !this.Right;
        //     console.log('123');
        // },2000);

        this.playerNode = cc.find('Canvas/bg/hero');
    },

    onCollisionEnter(other,self){
        if(other.node.group =='hero' && other.tag ==2 && this.hp >0 ){ 
            if(other.size.width == 0 || other.size.height == 0)return;  
            this.hurt();
        }
    },

    setAni(anima){
        if(this.anima == anima) return;

        this.anima = anima;
        this.ani.play(anima);
    },

    enemyAction(tt){
        let p_pos = this.playerNode.position;
        let e_pos = this.node.position;
        let dis = cc.Vec2.distance(e_pos,p_pos);
        let v = p_pos.sub(e_pos);
        let scaleX = Math.abs(this.node.scaleX)

        if(dis <= 50){
            this.moveLeft = false;
            this.moveRight = false;
           
            if (v.x<0){
                this.node.scaleX = -scaleX;
            }else{
                this.node.scaleX = scaleX;
            }
            this.enemyState = State.attack;
        }else if (dis <= 200) {
            
            if (v.x < 0) {
                this.moveLeft = true;
                this.moveRight =false;
            }else {
                this.moveLeft = false;
                this.moveRight = true;
            }
            this.enemyState = State.stand;

        }else{
            this.moveLeft = false;
            this.moveRight = false;
            this.enemyState = State.stand;
        }
    },

    die() {
        this.setAni('die');

        this.lv = this.rb.linearVelocity;
        this.lv.x = 0;
        this.rb.linearVelocity = this.lv;
    },
    
    hurt() {
        if (this.isHit)return;
        this.setAni('hurt');

        this.isHit = true;
        this.enemyState = State.hurt;

        this.lv = this.rb.linearVelocity;
        this.lv.x = 0;
        this.rb.linearVelocity = this.lv;

  
    },

    attack() {
        this.setAni('attack');

        this.lv = this.rb.linearVelocity;
        this.lv.x = 0;
        this.rb.linearVelocity = this.lv;

    },

    move (){
        // let anima = this.anima;
        let scaleX = Math.abs(this.node.scaleX);
        this.lv = this.rb.linearVelocity;

        if (this.moveLeft) {
            this.sp.x = -1;
            this.node.scaleX = -scaleX;
            this.setAni('run');
        }else if(this.moveRight){
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

    update (dt) {
        // 状态切换
        this.tt += dt;

        if (this.tt >= 0.3 && this.enemyState == State.stand ){
            this.enemyAction(dt);
            this.tt = 0;
        }

        if (this.enemyState == State.attack){
            this.attack();//攻击
        }else if (this.enemyState == State.stand){
            this.move();//移动
        }
        
    },
});
