var Biniu = function() {
};
Biniu.__name__ = true;
Biniu.main = function() {
	js.Lib.window.onload = function(e) {
		var b = new Biniu();
		b.run(js.Lib.document.documentElement);
	};
}
Biniu.prototype = {
	getBiniuCallbacks: function(userCallbacks) {
		var biniuCallbacks = new Biniulib().map;
		if(userCallbacks == null) return biniuCallbacks;
		var _g = 0, _g1 = Reflect.fields(userCallbacks);
		while(_g < _g1.length) {
			var userCallback = _g1[_g];
			++_g;
			biniuCallbacks[userCallback] = Reflect.field(userCallbacks,userCallback);
		}
		return biniuCallbacks;
	}
	,getBiniuAttributes: function(biniuNode) {
		if(biniuNode.attributes == null) return [];
		var attributes = [];
		var _g1 = 0, _g = biniuNode.attributes.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(biniuNode.attributes.item(i).name.indexOf("data-biniu") != -1) attributes.push(biniuNode.attributes.item(i).name);
		}
		return attributes;
	}
	,getBiniuEventType: function(biniuAttr) {
		var components = biniuAttr.split("-");
		return components[components.length - 1];
	}
	,resolveArgument: function(argument,context,biniuCallbacks) {
		if(Reflect.hasField(biniuCallbacks,argument)) return Reflect.field(biniuCallbacks,argument);
		if(Reflect.hasField(context.event,argument)) return Reflect.field(context.event,argument);
		if(context.event.detail != null) {
			if(Reflect.hasField(context.event.detail,argument)) return Reflect.field(context.event.detail,argument);
		}
		if(context.node.getAttribute(argument) != null) return context.node.getAttribute(argument);
		return argument;
	}
	,executeBiniu: function(components,context,biniuCallbacks) {
		if(!Reflect.hasField(biniuCallbacks,components[0])) throw "first value must be a registered method";
		var func = Reflect.field(biniuCallbacks,components[0]);
		var resolvedArgs = [];
		var _g1 = 0, _g = components.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(i != 0) {
				if(components[i] == Biniu.BINIU_CALL) {
					resolvedArgs.push(this.executeBiniu(components.slice(i + 1,components.length),context,biniuCallbacks));
					break;
				} else resolvedArgs.push(this.resolveArgument(components[i],context,biniuCallbacks));
			}
		}
		return func.apply(biniuCallbacks,[context,resolvedArgs]);
	}
	,parseBiniu: function(biniu) {
		var components = biniu.split(" ");
		var ret = [];
		var _g1 = 0, _g = components.length;
		while(_g1 < _g) {
			var i = _g1++;
			components[i] = StringTools.trim(components[i]);
			components[i] = StringTools.replace(components[i],"\n","");
			components[i] = StringTools.replace(components[i],"\r","");
			components[i] = StringTools.replace(components[i],"\t","");
			if(components[i] != "") ret.push(components[i]);
		}
		return ret;
	}
	,executeBinius: function(binius,context,biniuCallbacks) {
		var _g = 0, _g1 = binius.split(",");
		while(_g < _g1.length) {
			var biniu = _g1[_g];
			++_g;
			this.executeBiniu(this.parseBiniu(biniu),context,biniuCallbacks);
		}
	}
	,registerBiniu: function(biniuNode,biniuAttr,biniuCallbacks) {
		var _g = this;
		var eventType = this.getBiniuEventType(biniuAttr);
		var biniuExpr = biniuNode.getAttribute(biniuAttr);
		var node = biniuNode;
		node.addEventListener(eventType,function(e) {
			var context = { node : node, event : e};
			_g.executeBinius(biniuExpr,context,biniuCallbacks);
		});
	}
	,getBiniuNodes: function(node) {
		var biniuNodes = [];
		var _g1 = 0, _g = node.childNodes.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(this.getBiniuAttributes(node.childNodes[i]).length > 0) biniuNodes.push(node.childNodes[i]);
			var childBiniuNodes = this.getBiniuNodes(node.childNodes[i]);
			var _g3 = 0, _g2 = childBiniuNodes.length;
			while(_g3 < _g2) {
				var j = _g3++;
				biniuNodes.push(childBiniuNodes[j]);
			}
		}
		return biniuNodes;
	}
	,run: function(node,userCallbacks) {
		var biniuCallbacks = this.getBiniuCallbacks(userCallbacks);
		var biniuNodes = this.getBiniuNodes(node);
		var _g = 0;
		while(_g < biniuNodes.length) {
			var biniuNode = biniuNodes[_g];
			++_g;
			var _g1 = 0, _g2 = this.getBiniuAttributes(biniuNode);
			while(_g1 < _g2.length) {
				var biniuAttr = _g2[_g1];
				++_g1;
				this.registerBiniu(biniuNode,biniuAttr,biniuCallbacks);
			}
		}
	}
	,__class__: Biniu
}
var Biniulib = function() {
	this.map = { log : $bind(this,this.log), '+' : $bind(this,this.add), '-' : $bind(this,this.sub), '*' : $bind(this,this.mul), '/' : $bind(this,this.div), 'set-attr' : $bind(this,this.setAttribute), 'get-attr' : $bind(this,this.getAttribute), 'set-class' : $bind(this,this.addClass), 'remove-class' : $bind(this,this.removeClass), 'toggle-class' : $bind(this,this.toggleClass), 'set-style' : $bind(this,this.setStyle), 'remove-style' : $bind(this,this.removeStyle), 'toggle-style' : $bind(this,this.toggleStyle)};
};
Biniulib.__name__ = true;
Biniulib.prototype = {
	hasClass: function(element,className,orderedClassName) {
		if(orderedClassName == null) orderedClassName = false;
		if(element.className == null || StringTools.trim(element.className) == "" || className == null || StringTools.trim(className) == "") return false;
		if(orderedClassName) {
			var cns = className.split(" ");
			var ecns = element.className.split(" ");
			var result = Lambda.map(cns,function(cn) {
				return Lambda.indexOf(ecns,cn);
			});
			var prevR = 0;
			var $it0 = result.iterator();
			while( $it0.hasNext() ) {
				var r = $it0.next();
				if(r < prevR) return false;
				prevR = r;
			}
			return true;
		} else {
			var _g = 0, _g1 = className.split(" ");
			while(_g < _g1.length) {
				var cn = _g1[_g];
				++_g;
				if(cn == null || StringTools.trim(cn) == "") continue;
				var found = Lambda.has(element.className.split(" "),cn);
				if(!found) return false;
			}
			return true;
		}
	}
	,toggleClass: function(context,args) {
		var _g1 = 0, _g = args.length;
		while(_g1 < _g) {
			var i = _g1++;
			var element = context.node;
			var className = args[i];
			if(this.hasClass(element,className)) this.removeClass(context,args); else this.addClass(context,args);
		}
	}
	,removeClass: function(context,args) {
		var _g1 = 0, _g = args.length;
		while(_g1 < _g) {
			var i = _g1++;
			var element = context.node;
			var className = args[i];
			if(element.className == null || StringTools.trim(element.className) == "") return;
			var classNamesToKeep = [new Array()];
			var cns = [className.split(" ")];
			Lambda.iter(element.className.split(" "),(function(cns,classNamesToKeep) {
				return function(ecn) {
					if(!Lambda.has(cns[0],ecn)) classNamesToKeep[0].push(ecn);
				};
			})(cns,classNamesToKeep));
			element.className = classNamesToKeep[0].join(" ");
		}
	}
	,addClass: function(context,args) {
		var _g1 = 0, _g = args.length;
		while(_g1 < _g) {
			var i = _g1++;
			var element = [context.node];
			var className = args[i];
			if(element[0].className == null) element[0].className = "";
			Lambda.iter(className.split(" "),(function(element) {
				return function(cn) {
					if(!Lambda.has(element[0].className.split(" "),cn)) {
						if(element[0].className != "") element[0].className += " ";
						element[0].className += cn;
					}
				};
			})(element));
		}
	}
	,toggleStyle: function(context,args) {
		if(Reflect.field(context.node.style,args[0]) != "") this.removeStyle(context,args); else this.setStyle(context,args);
	}
	,removeStyle: function(context,args) {
		context.node.style[args[0]] = null;
	}
	,setStyle: function(context,args) {
		context.node.style[args[0]] = args[1];
	}
	,getAttribute: function(context,attr) {
		return context.node.getAttribute(attr);
	}
	,setAttribute: function(context,args) {
		context.node.setAttribute(args[0],args[1]);
	}
	,concat: function(context,args) {
		var concat = "";
		var _g1 = 0, _g = args.length;
		while(_g1 < _g) {
			var i = _g1++;
			concat += Std.string(args[i]);
		}
		return concat;
	}
	,div: function(context,args) {
		var sum = 0.0;
		var _g1 = 0, _g = args.length;
		while(_g1 < _g) {
			var i = _g1++;
			sum /= Std.parseFloat(args[i]);
		}
		return sum;
	}
	,mul: function(context,args) {
		var sum = 0.0;
		var _g1 = 0, _g = args.length;
		while(_g1 < _g) {
			var i = _g1++;
			sum *= Std.parseFloat(args[i]);
		}
		return sum;
	}
	,sub: function(context,args) {
		var sum = 0.0;
		var _g1 = 0, _g = args.length;
		while(_g1 < _g) {
			var i = _g1++;
			sum -= Std.parseFloat(args[i]);
		}
		return sum;
	}
	,add: function(context,args) {
		var sum = 0.0;
		var _g1 = 0, _g = args.length;
		while(_g1 < _g) {
			var i = _g1++;
			sum += Std.parseFloat(args[i]);
		}
		return sum;
	}
	,log: function(context,args) {
		var _g = 0;
		while(_g < args.length) {
			var arg = args[_g];
			++_g;
			console.log(arg);
		}
	}
	,__class__: Biniulib
}
var HxOverrides = function() { }
HxOverrides.__name__ = true;
HxOverrides.dateStr = function(date) {
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours();
	var mi = date.getMinutes();
	var s = date.getSeconds();
	return date.getFullYear() + "-" + (m < 10?"0" + m:"" + m) + "-" + (d < 10?"0" + d:"" + d) + " " + (h < 10?"0" + h:"" + h) + ":" + (mi < 10?"0" + mi:"" + mi) + ":" + (s < 10?"0" + s:"" + s);
}
HxOverrides.strDate = function(s) {
	switch(s.length) {
	case 8:
		var k = s.split(":");
		var d = new Date();
		d.setTime(0);
		d.setUTCHours(k[0]);
		d.setUTCMinutes(k[1]);
		d.setUTCSeconds(k[2]);
		return d;
	case 10:
		var k = s.split("-");
		return new Date(k[0],k[1] - 1,k[2],0,0,0);
	case 19:
		var k = s.split(" ");
		var y = k[0].split("-");
		var t = k[1].split(":");
		return new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
	default:
		throw "Invalid date format : " + s;
	}
}
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
}
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
}
HxOverrides.remove = function(a,obj) {
	var i = 0;
	var l = a.length;
	while(i < l) {
		if(a[i] == obj) {
			a.splice(i,1);
			return true;
		}
		i++;
	}
	return false;
}
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
}
var IntIter = function(min,max) {
	this.min = min;
	this.max = max;
};
IntIter.__name__ = true;
IntIter.prototype = {
	next: function() {
		return this.min++;
	}
	,hasNext: function() {
		return this.min < this.max;
	}
	,__class__: IntIter
}
var Lambda = function() { }
Lambda.__name__ = true;
Lambda.array = function(it) {
	var a = new Array();
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		a.push(i);
	}
	return a;
}
Lambda.list = function(it) {
	var l = new List();
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		l.add(i);
	}
	return l;
}
Lambda.map = function(it,f) {
	var l = new List();
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		l.add(f(x));
	}
	return l;
}
Lambda.mapi = function(it,f) {
	var l = new List();
	var i = 0;
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		l.add(f(i++,x));
	}
	return l;
}
Lambda.has = function(it,elt,cmp) {
	if(cmp == null) {
		var $it0 = $iterator(it)();
		while( $it0.hasNext() ) {
			var x = $it0.next();
			if(x == elt) return true;
		}
	} else {
		var $it1 = $iterator(it)();
		while( $it1.hasNext() ) {
			var x = $it1.next();
			if(cmp(x,elt)) return true;
		}
	}
	return false;
}
Lambda.exists = function(it,f) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) return true;
	}
	return false;
}
Lambda.foreach = function(it,f) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(!f(x)) return false;
	}
	return true;
}
Lambda.iter = function(it,f) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		f(x);
	}
}
Lambda.filter = function(it,f) {
	var l = new List();
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) l.add(x);
	}
	return l;
}
Lambda.fold = function(it,f,first) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		first = f(x,first);
	}
	return first;
}
Lambda.count = function(it,pred) {
	var n = 0;
	if(pred == null) {
		var $it0 = $iterator(it)();
		while( $it0.hasNext() ) {
			var _ = $it0.next();
			n++;
		}
	} else {
		var $it1 = $iterator(it)();
		while( $it1.hasNext() ) {
			var x = $it1.next();
			if(pred(x)) n++;
		}
	}
	return n;
}
Lambda.empty = function(it) {
	return !$iterator(it)().hasNext();
}
Lambda.indexOf = function(it,v) {
	var i = 0;
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var v2 = $it0.next();
		if(v == v2) return i;
		i++;
	}
	return -1;
}
Lambda.concat = function(a,b) {
	var l = new List();
	var $it0 = $iterator(a)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		l.add(x);
	}
	var $it1 = $iterator(b)();
	while( $it1.hasNext() ) {
		var x = $it1.next();
		l.add(x);
	}
	return l;
}
var List = function() {
	this.length = 0;
};
List.__name__ = true;
List.prototype = {
	map: function(f) {
		var b = new List();
		var l = this.h;
		while(l != null) {
			var v = l[0];
			l = l[1];
			b.add(f(v));
		}
		return b;
	}
	,filter: function(f) {
		var l2 = new List();
		var l = this.h;
		while(l != null) {
			var v = l[0];
			l = l[1];
			if(f(v)) l2.add(v);
		}
		return l2;
	}
	,join: function(sep) {
		var s = new StringBuf();
		var first = true;
		var l = this.h;
		while(l != null) {
			if(first) first = false; else s.b += Std.string(sep);
			s.b += Std.string(l[0]);
			l = l[1];
		}
		return s.b;
	}
	,toString: function() {
		var s = new StringBuf();
		var first = true;
		var l = this.h;
		s.b += Std.string("{");
		while(l != null) {
			if(first) first = false; else s.b += Std.string(", ");
			s.b += Std.string(Std.string(l[0]));
			l = l[1];
		}
		s.b += Std.string("}");
		return s.b;
	}
	,iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
	,remove: function(v) {
		var prev = null;
		var l = this.h;
		while(l != null) {
			if(l[0] == v) {
				if(prev == null) this.h = l[1]; else prev[1] = l[1];
				if(this.q == l) this.q = prev;
				this.length--;
				return true;
			}
			prev = l;
			l = l[1];
		}
		return false;
	}
	,clear: function() {
		this.h = null;
		this.q = null;
		this.length = 0;
	}
	,isEmpty: function() {
		return this.h == null;
	}
	,pop: function() {
		if(this.h == null) return null;
		var x = this.h[0];
		this.h = this.h[1];
		if(this.h == null) this.q = null;
		this.length--;
		return x;
	}
	,last: function() {
		return this.q == null?null:this.q[0];
	}
	,first: function() {
		return this.h == null?null:this.h[0];
	}
	,push: function(item) {
		var x = [item,this.h];
		this.h = x;
		if(this.q == null) this.q = x;
		this.length++;
	}
	,add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,__class__: List
}
var Reflect = function() { }
Reflect.__name__ = true;
Reflect.hasField = function(o,field) {
	return Object.prototype.hasOwnProperty.call(o,field);
}
Reflect.field = function(o,field) {
	var v = null;
	try {
		v = o[field];
	} catch( e ) {
	}
	return v;
}
Reflect.setField = function(o,field,value) {
	o[field] = value;
}
Reflect.getProperty = function(o,field) {
	var tmp;
	return o == null?null:o.__properties__ && (tmp = o.__properties__["get_" + field])?o[tmp]():o[field];
}
Reflect.setProperty = function(o,field,value) {
	var tmp;
	if(o.__properties__ && (tmp = o.__properties__["set_" + field])) o[tmp](value); else o[field] = value;
}
Reflect.callMethod = function(o,func,args) {
	return func.apply(o,args);
}
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
}
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && !(f.__name__ || f.__ename__);
}
Reflect.compare = function(a,b) {
	return a == b?0:a > b?1:-1;
}
Reflect.compareMethods = function(f1,f2) {
	if(f1 == f2) return true;
	if(!Reflect.isFunction(f1) || !Reflect.isFunction(f2)) return false;
	return f1.scope == f2.scope && f1.method == f2.method && f1.method != null;
}
Reflect.isObject = function(v) {
	if(v == null) return false;
	var t = typeof(v);
	return t == "string" || t == "object" && !v.__enum__ || t == "function" && (v.__name__ || v.__ename__);
}
Reflect.deleteField = function(o,f) {
	if(!Reflect.hasField(o,f)) return false;
	delete(o[f]);
	return true;
}
Reflect.copy = function(o) {
	var o2 = { };
	var _g = 0, _g1 = Reflect.fields(o);
	while(_g < _g1.length) {
		var f = _g1[_g];
		++_g;
		o2[f] = Reflect.field(o,f);
	}
	return o2;
}
Reflect.makeVarArgs = function(f) {
	return function() {
		var a = Array.prototype.slice.call(arguments);
		return f(a);
	};
}
var Std = function() { }
Std.__name__ = true;
Std["is"] = function(v,t) {
	return js.Boot.__instanceof(v,t);
}
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
Std["int"] = function(x) {
	return x | 0;
}
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
}
Std.parseFloat = function(x) {
	return parseFloat(x);
}
Std.random = function(x) {
	return Math.floor(Math.random() * x);
}
var StringBuf = function() {
	this.b = "";
};
StringBuf.__name__ = true;
StringBuf.prototype = {
	toString: function() {
		return this.b;
	}
	,addSub: function(s,pos,len) {
		this.b += HxOverrides.substr(s,pos,len);
	}
	,addChar: function(c) {
		this.b += String.fromCharCode(c);
	}
	,add: function(x) {
		this.b += Std.string(x);
	}
	,__class__: StringBuf
}
var StringTools = function() { }
StringTools.__name__ = true;
StringTools.urlEncode = function(s) {
	return encodeURIComponent(s);
}
StringTools.urlDecode = function(s) {
	return decodeURIComponent(s.split("+").join(" "));
}
StringTools.htmlEscape = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
StringTools.htmlUnescape = function(s) {
	return s.split("&gt;").join(">").split("&lt;").join("<").split("&amp;").join("&");
}
StringTools.startsWith = function(s,start) {
	return s.length >= start.length && HxOverrides.substr(s,0,start.length) == start;
}
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	return slen >= elen && HxOverrides.substr(s,slen - elen,elen) == end;
}
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c >= 9 && c <= 13 || c == 32;
}
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
}
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return HxOverrides.substr(s,0,l - r); else return s;
}
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
}
StringTools.rpad = function(s,c,l) {
	var sl = s.length;
	var cl = c.length;
	while(sl < l) if(l - sl < cl) {
		s += HxOverrides.substr(c,0,l - sl);
		sl = l;
	} else {
		s += c;
		sl += cl;
	}
	return s;
}
StringTools.lpad = function(s,c,l) {
	var ns = "";
	var sl = s.length;
	if(sl >= l) return s;
	var cl = c.length;
	while(sl < l) if(l - sl < cl) {
		ns += HxOverrides.substr(c,0,l - sl);
		sl = l;
	} else {
		ns += c;
		sl += cl;
	}
	return ns + s;
}
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
}
StringTools.hex = function(n,digits) {
	var s = "";
	var hexChars = "0123456789ABCDEF";
	do {
		s = hexChars.charAt(n & 15) + s;
		n >>>= 4;
	} while(n > 0);
	if(digits != null) while(s.length < digits) s = "0" + s;
	return s;
}
StringTools.fastCodeAt = function(s,index) {
	return s.charCodeAt(index);
}
StringTools.isEOF = function(c) {
	return c != c;
}
var js = js || {}
js.Boot = function() { }
js.Boot.__name__ = true;
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
js.Boot.__trace = function(v,i) {
	var msg = i != null?i.fileName + ":" + i.lineNumber + ": ":"";
	msg += js.Boot.__string_rec(v,"");
	var d;
	if(typeof(document) != "undefined" && (d = document.getElementById("haxe:trace")) != null) d.innerHTML += js.Boot.__unhtml(msg) + "<br/>"; else if(typeof(console) != "undefined" && console.log != null) console.log(msg);
}
js.Boot.__clear_trace = function() {
	var d = document.getElementById("haxe:trace");
	if(d != null) d.innerHTML = "";
}
js.Boot.isClass = function(o) {
	return o.__name__;
}
js.Boot.isEnum = function(e) {
	return e.__ename__;
}
js.Boot.getClass = function(o) {
	return o.__class__;
}
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2, _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i;
			var str = "[";
			s += "\t";
			var _g = 0;
			while(_g < l) {
				var i1 = _g++;
				str += (i1 > 0?",":"") + js.Boot.__string_rec(o[i1],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) { ;
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
}
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0, _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
}
js.Boot.__instanceof = function(o,cl) {
	try {
		if(o instanceof cl) {
			if(cl == Array) return o.__enum__ == null;
			return true;
		}
		if(js.Boot.__interfLoop(o.__class__,cl)) return true;
	} catch( e ) {
		if(cl == null) return false;
	}
	switch(cl) {
	case Int:
		return Math.ceil(o%2147483648.0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return o === true || o === false;
	case String:
		return typeof(o) == "string";
	case Dynamic:
		return true;
	default:
		if(o == null) return false;
		if(cl == Class && o.__name__ != null) return true; else null;
		if(cl == Enum && o.__ename__ != null) return true; else null;
		return o.__enum__ == cl;
	}
}
js.Boot.__cast = function(o,t) {
	if(js.Boot.__instanceof(o,t)) return o; else throw "Cannot cast " + Std.string(o) + " to " + Std.string(t);
}
js.Lib = function() { }
js.Lib.__name__ = true;
js.Lib.debug = function() {
	debugger;
}
js.Lib.alert = function(v) {
	alert(js.Boot.__string_rec(v,""));
}
js.Lib.eval = function(code) {
	return eval(code);
}
js.Lib.setErrorHandler = function(f) {
	js.Lib.onerror = f;
}
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; };
var $_;
function $bind(o,m) { var f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; return f; };
if(Array.prototype.indexOf) HxOverrides.remove = function(a,o) {
	var i = a.indexOf(o);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
}; else null;
Math.__name__ = ["Math"];
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i) {
	return isNaN(i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.prototype.__class__ = Array;
Array.__name__ = true;
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
var Void = { __ename__ : ["Void"]};
if(typeof document != "undefined") js.Lib.document = document;
if(typeof window != "undefined") {
	js.Lib.window = window;
	js.Lib.window.onerror = function(msg,url,line) {
		var f = js.Lib.onerror;
		if(f == null) return false;
		return f(msg,[url + ":" + line]);
	};
}
Biniu.BINIU_PREFIX = "data-biniu";
Biniu.BINIU_CALL = "_";
Biniu.main();
