/*
 * TLV Decoder JavaScript Library v0.1
 *
 * Copyright (c) 2013 Robin Burel
 * Licensed under the MIT
 *
 * Date: 2013-07-06
 */

function TLVDecoder() {
    var CONST_IDTAG = 31;
    var CONST_PC = 32;
    var CONST_LEN = 128;
    this.tlv = [];
    var self = this;

    function TLVObject(tag, len, val) {
        this.tag = tag;
        this.len = len;
        this.val = val;
        this.getTotalSequence = function() {
            return (this.tag + this.len + this.val).length
        };
        this.isConstructed = function() {
            return (parseInt(this.tag.substring(0, 2), 16) & CONST_PC) == CONST_PC
        };
        this.computeChildren = function() {
            if (this.isConstructed()) {
                this.val = this.parse(this.val);
                if (Object.prototype.toString.call(this.val) === "[object Array]")
                    for (var i =
                            0; i < this.val.length; i++) this.val[i].computeChildren()
            }
        };
        this.parse = function(sequence) {
            tmpArray = [];
            while (sequence !== "") {
                tlv = self.getTLV(sequence);
                sequence = sequence.substring(tlv.getTotalSequence());
                tmpArray.push(tlv)
            }
            return tmpArray
        }
    }
    this.getTag = function(sequence) {
        tag = sequence[0] + sequence[1];
        if ((parseInt(tag, 16) & CONST_IDTAG) == CONST_IDTAG) tag += sequence[2] + sequence[3];
        return tag
    };
    this.getLen = function(sequence) {
        len = sequence[0] + sequence[1];
        lenBytes = 1;
        if ((parseInt(len, 16) & CONST_LEN) == CONST_LEN) lenBytes = parseInt(len[1], 16) * 2;
        if (lenBytes > 1)
            for (var i = 2; i <= lenBytes; i += 2) len += sequence[i] + sequence[i + 1];
        return len
    };
    this.getTotalLen = function(len) {
        if (len.length > 2) {
            len = len.substring(2);
            return parseInt(len, 16) * 2
        } else return parseInt(len, 16) * 2
    };
    this.parseTLV = function(sequence) {
        this.tlv = [];
        sequence = this.removeWhiteSpaces(sequence);
        while (sequence !== "") {
            obj = this.getTLV(sequence);
            sequence = sequence.substring(obj.getTotalSequence());
            this.tlv.push(obj)
        }
        for (var i = 0; i < this.tlv.length; i++) this.tlv[i].computeChildren()
    };
    this.getTLV = function(sequence) {
        tmp = new TLVObject(null,
                null, null);
        tag = this.getTag(sequence);
        sequence = sequence.substring(tag.length);
        len = this.getLen(sequence);
        sequence = sequence.substring(len.length);
        tmp.len = len;
        tmp.tag = tag;
        tmp.val = sequence.substring(0, this.getTotalLen(len));
        return tmp
    };
    this.removeWhiteSpaces = function(str) {
        return str.replace(/ /g, '');
    };
    this.encode = function(tag, val) {
        tag = this.removeWhiteSpaces(tag);
        val = this.removeWhiteSpaces(val);
        tmp = new TLVObject(tag, null, val);
        lengthVal = (val.length / 2).toString(16);
        if (lengthVal.length % 2 != 0) {
            lengthVal = "0" + lengthVal;
        }
        if (parseInt(lengthVal, 16) > 0x80) {
            len = "8" + (lengthVal.length / 2).toString(16);
            len += lengthVal;
        } else {
            len = lengthVal;
        }

        tmp.len = len;

        return tmp;
    };

    this.encodeDGI = function(tag, val) {
        tag = this.removeWhiteSpaces(tag);
        val = this.removeWhiteSpaces(val);
        tmp = new TLVObject(tag, null, val);
        lengthHexa = (val.length / 2).toString(16);
        if (lengthHexa.length % 2 !== 0) {
            lengthHexa = "0" + lengthHexa;
        }
        len = "";
        if (parseInt(lengthHexa, 16) > 0xFE) {
            len += "FF";
            len += lengthHexa;
        } else {
            len = lengthHexa;
        }
        tmp.len = len;
        return tmp
    };
}