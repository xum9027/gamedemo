// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {
        this.hero = this.node.parent.getComponent('hero');
    },

    onCollisionEnter(other,self){
        console.log('怪碰了');
        if(other.node.group =='enemy'){
            if(other.size.width == 0 || other.size.height == 0)return;
            this.hero.hurt();
        }
    },
    // update (dt) {},
});
