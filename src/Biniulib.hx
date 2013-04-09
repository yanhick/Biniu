package ;

import js.Dom;
import js.Lib;

using StringTools;

/**
 * Contains all "standard" method
 * which can be used in biniu expressions
 * 
 * @author Yannick DOMINGUEZ
 */
class Biniulib 
{

	/**
	 * hold key/value pairs where
	 * key is alias for a func and
	 * value if func
	 */
	public var map:Dynamic;
	
	public function new() 
	{
		map = {
			'log':log,
			'+':add,
			'-':sub,
			'*':mul,
			'/':div,
			'set-attr':setAttribute,
			'get-attr':getAttribute,
			'set-class':addClass,
			'remove-class':removeClass,
			'toggle-class':toggleClass,
			'set-style':setStyle,
			'remove-style':removeStyle,
			'toggle-style':toggleStyle,
			'concat':concat,
			'send':dispatch
		}
	}
	
	function log(context, args:Array<Dynamic>)
	{
		for (arg in args)
		{
			trace(arg);
		}
		
	}
	
	//////////////////
	// OPERATORS
	/////////////////
	
	function add(context, args:Array<Dynamic>)
	{
		var sum = 0.0;
		
		for (i in 0...args.length)
		{
			sum += Std.parseFloat(args[i]);
		}
		
		return sum;
	}
	
	function sub(context, args:Array<Dynamic>)
	{
		var sum = 0.0;
		
		for (i in 0...args.length)
		{
			sum -= Std.parseFloat(args[i]);
		}
		
		return sum;
	}
	
	function mul(context, args:Array<Dynamic>)
	{
		var sum = 0.0;
		
		for (i in 0...args.length)
		{
			sum *= Std.parseFloat(args[i]);
		}
		
		return sum;
	}
	
	function div(context, args:Array<Dynamic>)
	{
		var sum = 0.0;
		
		for (i in 0...args.length)
		{
			sum /= Std.parseFloat(args[i]);
		}
		
		return sum;
	}
	
	//////////////////
	// String
	/////////////////
	
	function concat(context, args:Array<Dynamic>)
	{
		var concat = "";
		
		for (i in 0...args.length)
		{
			concat += Std.string(args[i]);
		}
		
		return concat;
	}
	
	//////////////////
	// event
	/////////////////
	
	function dispatch(context, args:Array<Dynamic>)
	{
		var eventType = args[0];
		args.shift();
		var detail:Dynamic = { };
		
		while (args.length > 0)
		{
			Reflect.setField(detail, args.shift(), args.shift());
		}
		
		var customEvent:Dynamic = untyped Lib.document.createEvent("CustomEvent");
		customEvent.initCustomEvent(eventType, true, true, detail);
		context.node.dispatchEvent(customEvent);
	}
	
	
	//////////////////
	// DOM
	/////////////////
	
	function setAttribute(context, args:Array<Dynamic>)
	{
		context.node.setAttribute(args[0], args[1]);
	}
	
	function getAttribute(context, attr)
	{
		return context.node.getAttribute(attr);
	}
	
	//////////////////
	// INLINE STYLE
	/////////////////
	
	function setStyle(context, args:Array<Dynamic>)
	{
		Reflect.setField(context.node.style, args[0], args[1]);
	}
	
	function removeStyle(context, args:Array<Dynamic>)
	{
		Reflect.setField(context.node.style, args[0], null);
	}
	
	function toggleStyle(context, args:Array<Dynamic>)
	{
		if (Reflect.field(context.node.style, args[0]) != "")
		{
			removeStyle(context, args);
		}
		else
		{
			setStyle(context, args);
		}
	}
	
	//////////////////
	// BRIX CLASS METHODS
	/////////////////
	
	function addClass(context, args:Array<Dynamic>)
	{
		for (i in 0...args.length)
		{
			var element:HtmlDom = context.node;
			var className = args[i];
			
			if (element.className == null) element.className = "";
			Lambda.iter( className.split(" "), function(cn:String) { if (!Lambda.has(element.className.split(" "), cn)) { if (element.className != "") { element.className += " "; } element.className += cn; } } );
		}
	}
	
	function removeClass(context, args:Array<Dynamic>)
	{
		for (i in 0...args.length)
		{
			var element:HtmlDom = context.node;
			var className = args[i];
			
			if (element.className == null || element.className.trim() == "") return;

			var classNamesToKeep:Array<String> = new Array();
			var cns = className.split(" ");

			Lambda.iter( element.className.split(" "), function(ecn:String) { if (!Lambda.has(cns, ecn)) { classNamesToKeep.push(ecn); } } );

			element.className = classNamesToKeep.join(" ");
		}
	}
	
	function toggleClass(context, args:Array<Dynamic>)
	{
		for (i in 0...args.length)
		{
			var element:HtmlDom = context.node;
			var className = args[i];
			
			if(hasClass(element, className))
				removeClass(context, args);
			else
				addClass(context, args);
		}
	}
	
	//////////////////
	// UTILS METHODS
	/////////////////
	
	function hasClass(element:HtmlDom, className:String, ?orderedClassName:Bool=false):Bool
	{
		if (element.className == null || element.className.trim() == "" || className == null || className.trim() == "") return false;

		if (orderedClassName)
		{
			var cns:Array<String> = className.split(" ");
			var ecns:Array<String> = element.className.split(" ");

			var result:List<Int> = Lambda.map( cns, function (cn:String) { return Lambda.indexOf(ecns, cn); } );
			var prevR:Int = 0;
			for (r in result)
			{
				if (r < prevR)
				{
					return false;
				}
				prevR = r;
			}
			return true;
		}
		else
		{
			for (cn in className.split(" "))
			{
				if (cn == null || cn.trim() == "")
				{
					continue;
				}
				var found:Bool = Lambda.has(element.className.split(" "), cn);

				if (!found)
				{
					return false;
				}
			}
			return true;
		}
	}
}