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
        enemyPrefab:{
            default: null,
            type: cc.Prefab
        },
        hp: {
            default: 50,
            type: cc.Integer,
        },
    },


    onLoad () {
        this.maxHp = 50;

        this.isHit = false;
        this.anima = 'idle';
        this.ani = this.node.getChildByName('body').getComponent(cc.Animation);
        this.attackBox = this.node.getChildByName('body').getComponent(cc.BoxCollider);
        this.hpBar = this.node.getChildByName('hpBar').getComponent(cc.ProgressBar);
        this.rb = this.node.getComponent(cc.RigidBody);
        this.canAttack = true;

        this._speed =40;
        this.sp = cc.v2(0,0);
        this.tt = 0;
        this.a = 0;
        
        this.minotaurState = State.stand;

        this.ani.on('finished', (e, data) => {
            if (data.name == 'hurt'){
                this.hp--;
                this.isHit = false;
                if(this.hp%(this.maxHp/10)==0)this.hpBar.progress -= 0.1;

                if(this.hp ==0){
                    this.die();
                }else{
                    this.minotaurState = State.stand;
                }
                if(!this.canAttack){
                    setTimeout(() => {
                        this.canAttack = true;
                    },3000)
                }
            }else if (data.name == 'attack'|| data.name == 'attack2' || data.name == 'attack3' || data.name == 'attack4') {
                this.setAni('idle');
                this.minotaurState = State.stand;
                setTimeout(() => {
                    this.canAttack = true;
                },3000)
            }else if (data.name == 'die') {
                this.node.destroy();
                this.winNode.active = true;
            }
            else if (data.name == 'preparation') {
                this.heroState = State.stand;
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
        this.bgNode = cc.find('Canvas/bg');
        this.hpNode  = this.node.getChildByName('hero_hp');
        this.winNode = cc.find('Canvas/bg/win_label');
    },

    onCollisionEnter(other,self){
        if(other.node.group =='hero' && other.tag ==2 && this.hp >0 ){
            if(other.size.width == 0 || other.size.height == 0)return;  
            this.hurt();
        }
    },

    setAni(anima){
        if(this.anima == anima) return;

        if(this.minotaurState == State.attack){
            this.canAttack = false;
        } 
        this.anima = anima;
        this.ani.play(anima);
        this.a = 0;
    },

    minotaurAction(tt){
        let p_pos = this.playerNode.position;
        let e_pos = this.node.position;
        let dis = cc.Vec2.distance(e_pos,p_pos);
        let v = p_pos.sub(e_pos);
        let scaleX = Math.abs(this.node.scaleX)

        if(dis <= 80 && this.canAttack){
            this.moveLeft = false;
            this.moveRight = false;
           
            if (v.x<0){
                this.node.scaleX = -scaleX;
            }else{
                this.node.scaleX = scaleX;
            }
            this.minotaurState = State.attack;
        }else if (dis <= 500) {
            
            if (v.x < 0) {
                this.moveLeft = true;
                this.moveRight =false;
            }else {
                this.moveLeft = false;
                this.moveRight = true;
            }
            this.minotaurState = State.stand;

        }else{
            this.moveLeft = false;
            this.moveRight = false;
            this.minotaurState = State.stand;
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
        this.minotaurState = State.hurt;

        this.lv = this.rb.linearVelocity;
        this.lv.x = 0;
        this.rb.linearVelocity = this.lv;

  
    },

    attack() {    
        if(this.a ==0 ){
            this.a = Math.floor(Math.random()*(3-1+1)+1);
        }else{
            return;
        }
        if(this.hp % 10 == 0 && this.hp <= 40 ){
            this.a = 4;
            this.hp -= 1;
        }
        switch (this.a){
            case 1:
                this.setAni('attack');
            break;
            case 2:
                this.setAni('attack2');
            break;
            case 3:
                this.setAni('attack3');
            break;
            case 4:
                this.setAni('attack4');
               for (let i = -1; i < 2; i++) {
                   this.spawnNewenemy(i);
               }
            break;
        }
        
        this.lv = this.rb.linearVelocity;
        this.lv.x = 0;
        this.rb.linearVelocity = this.lv;

    },

    spawnNewenemy(i) {
        var newEnemy = cc.instantiate(this.enemyPrefab);
        this.bgNode.addChild(newEnemy);
        newEnemy.setPosition(this.getNewEnemyPosition(i))
    },

    getNewEnemyPosition(i){
        var eX = this.node.x +50*i;
        var eY = this.node.y +50;
        return cc.v2(eX, eY);
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

        if (this.tt >= 0.3 && this.minotaurState == State.stand ){
            this.minotaurAction(dt);
            this.tt = 0;
        }

        if (this.minotaurState == State.attack){
            this.attack();//攻击
        }else if (this.minotaurState == State.stand){
            this.move();//移动
        }

        if(this.minotaurState == State.attack){
            this.attackBox.enabled = true;
        }else{
            this.attackBox.enabled = false;
        }
        
    },
});
