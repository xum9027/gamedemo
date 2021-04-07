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

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.preloadScene("game");

        this.helpNode = cc.find('Canvas/bg/help_label');
        console.log(this.helpNode);
    },

    openhelp(){
        this.helpNode.active = true;
    },

    closehelp(){
        this.helpNode.active = false;
    },
    
    changeScene(){
        cc.director.loadScene("game");
    },
    // update (dt) {},
});
