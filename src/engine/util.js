
  export default class util {
    static clone (sObj) {
      if (sObj === null || typeof sObj !== "object") {
          return sObj;
      }

      var s = {};
      if (sObj.constructor === Array) {
          s = [];
      }

      for (var i in sObj) {
          if (sObj.hasOwnProperty(i)) {
              s[i] = this.clone(sObj[i]);
          }
      }

      return s;
    }

    /**
     * 将object转化为数组。
     */
    static objectToArray (srcObj) {

      var resultArr = [];

      // to array
      for (var key in srcObj) {
          if (!srcObj.hasOwnProperty(key)) {
              continue;
          }

          resultArr.push(srcObj[key]);
      }

      return resultArr;
    }

    static formatTime(date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const second = date.getSeconds();

      formatNumber = n => {
        n = n.toString();
        return n[1] ? n : '0' + n;
      };
    
      return [year, month, day].map(formatNumber).join('-');
    };

    /**
     * 格式化钱数，超过10000 转换位 10K   10000K 转换为 10M
     */
    static formatMoney (money) {
      var arrUnit = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'B', 'N', 'D'];

      var strValue = '';
      for (var idx = 0; idx < arrUnit.length; idx++) {
          if (money >= 10000) {
              money /= 1000;
          } else {
              strValue = Math.floor(money) + arrUnit[idx];
              break;
          }
      }

      if (strValue === '') {
          strValue = Math.floor(money) + 'U'; //超过最大值就加个U
      }

      return strValue;
    }
  
    static formatPeoplePlay(pepole) {
      pepole = Number(pepole);
      if (pepole < 10000) {
        return pepole + '人在玩';
      } else {
        return Math.floor(pepole / 10000) + '万人在玩';
      }
    };
  
    static formatScore(score) {
      score = Number(score);
      if (score < 0) {
        score = '0.0';
      } else {
        score = score / 10;
        score = score.toFixed(1);
      }
  
      return score + "分";
    };

    static _utf8_encode (string) {
      string = string.replace(/\r\n/g, "\n");
      var utftext = "";
    
      for (var n = 0; n < string.length; n++) {
    
          var c = string.charCodeAt(n);
    
          if (c < 128) {
              utftext += String.fromCharCode(c);
          } else if ((c > 127) && (c < 2048)) {
              utftext += String.fromCharCode((c >> 6) | 192);
              utftext += String.fromCharCode((c & 63) | 128);
          } else {
              utftext += String.fromCharCode((c >> 12) | 224);
              utftext += String.fromCharCode(((c >> 6) & 63) | 128);
              utftext += String.fromCharCode((c & 63) | 128);
          }
    
      }
    
      return utftext;
    };
  
    static base64encode (input) {
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;
      var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  
      input = _utf8_encode(input);
  
      while (i < input.length) {
  
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);
  
          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;
  
          if (isNaN(chr2)) {
              enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
              enc4 = 64;
          }
  
          output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
  
      }
  
      return output;
    };

    static contains (rect, point) {
        return (rect.x <= point.x &&
            rect.x + rect.width >= point.x &&
            rect.y <= point.y &&
            rect.y + rect.height >= point.y);
    };

    /**
     * 求两点间距离
     * @param {*} pos1 
     * @param {*} pos2 
     */
    static pDistance (pos1, pos2) {
      return Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2));
    }

    /**
     * 根据剩余秒数格式化剩余时间 返回 HH:MM:SS
     * @param {Number} leftSec 
     */
    static formatTimeForSecond (leftSec) {
      let timeStr = '';
      let sec = leftSec % 60;
  
      let leftMin = Math.floor(leftSec / 60);
      leftMin = leftMin < 0 ? 0 : leftMin;
  
      let hour = Math.floor(leftMin / 60);
      let min = leftMin % 60;
  
      if (hour > 0) {
          timeStr += hour > 9 ? hour.toString() : '0' + hour;
          timeStr += ':';
      }
      
      timeStr += min > 9 ? min.toString() : '0' + min;
      timeStr += ':';
      timeStr += sec > 9 ? sec.toString() : '0' + sec;
      return timeStr;
    }

    static basePullAt(array, indexes) {
      var length = array ? indexes.length : 0;
      var lastIndex = length - 1;
      var previous;

      while (length--) {
          var index = indexes[length];
          if (length === lastIndex || index !== previous) {
              previous = index;
              Array.prototype.splice.call(array, index, 1);
          }
      }

      return array;
    }

    static remove(array, predicate) {
      var result = [];
      var indexes = [];
      array.forEach(function (item, index) {
          if (predicate(item)) {
              result.push(item);
              indexes.push(index);
          }
      });

      this.basePullAt(array, indexes);
      return result;
    }

    static randArray(arr) {
      let arrClone = this.clone(arr);
      // 首先从最大的数开始遍历，之后递减
      for (let i = arrClone.length - 1; i >= 0; i--) {
          // 随机索引值randomIndex是从0-arr.length中随机抽取的
          const randomIndex = Math.floor(Math.random() * (i + 1));
          // 下面三句相当于把从数组中随机抽取到的值与当前遍历的值互换位置
          const itemIndex = arrClone[randomIndex];
          arrClone[randomIndex] = arrClone[i];
          arrClone[i] = itemIndex;
      }
      // 每一次的遍历都相当于把从数组中随机抽取（不重复）的一个元素放到数组的最后面（索引顺序为：len-1,len-2,len-3......0）
      return arrClone;
    }
  };
  