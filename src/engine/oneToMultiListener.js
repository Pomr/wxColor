
export class oneToMultiListener {
    static handlers = {};
    static supportEvent = {};

    static on (eventName, handler, target) {
        var objHandler = {handler: handler, target: target};
        var handlerList = this.handlers[eventName];
        if (!handlerList) {
            handlerList = [];
            this.handlers[eventName] = handlerList;
        }

        for (var i = 0; i < handlerList.length; i++) {
            if (!handlerList[i]) {
                handlerList[i] = objHandler;
                return i;
            }
        }

        handlerList.push(objHandler);

        return handlerList.length;
    };

    static off (eventName, handler, target) {
        var handlerList = this.handlers[eventName];

        if (!handlerList) {
            return;
        }

        for (var i = 0; i < handlerList.length; i++) {
            var oldObj = handlerList[i];
            if (oldObj.handler === handler && (!target || target === oldObj.target)) {
                handlerList.splice(i, 1);
                break;
            }
        }
    };

    static dispatchEvent (eventName/**/, ...args) {
        // if (this.supportEvent !== null && !this.supportEvent.hasOwnProperty(eventName)) {
        //     cc.error("please add the event into clientEvent.js");
        //     return;
        // }

        var handlerList = this.handlers[eventName];

        var args = [];
        var i;
        for (i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        if (!handlerList) {
            return;
        }

        for (i = 0; i < handlerList.length; i++) {
            var objHandler = handlerList[i];
            if (objHandler.handler) {
                objHandler.handler.apply(objHandler.target, args);
            }
        }
    };

    static setSupportEventList (arrSupportEvent) {
        if (!(arrSupportEvent instanceof Array)) {
            cc.error("supportEvent was not array");
            return false;
        }

        this.supportEvent = {};
        for (var i in arrSupportEvent) {
            var eventName = arrSupportEvent[i];
            this.supportEvent[eventName] = i;
        }
    

        return true;
    };
}