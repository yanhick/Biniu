package ;

import js.Dom;

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
			'toggle-style':toggleStyle
		}
	}
	
	function log(context, msg)
	{
		trace(msg);
	}
	
	//////////////////
	// OPERATORS
	/////////////////
	
	function add(context, a, b)
	{
		return Std.parseFloat(a) + Std.parseFloat(b);
	}
	
	function sub(context, a, b)
	{
		return Std.parseFloat(a) - Std.parseFloat(b);
	}
	
	function mul(context, a, b)
	{
		return Std.parseFloat(a) * Std.parseFloat(b);
	}
	
	function div(context, a, b)
	{
		return Std.parseFloat(a) / Std.parseFloat(b);
	}
	
	//////////////////
	// DOM
	/////////////////
	
	function setAttribute(context, attr, value)
	{
		context.node.setAttribute(attr, value);
	}
	
	function getAttribute(context, attr)
	{
		return context.node.getAttribute(attr);
	}
	
	//////////////////
	// INLINE STYLE
	/////////////////
	
	function setStyle(context, styleName, value)
	{
		Reflect.setField(context.node.style, styleName, value);
	}
	
	function removeStyle(context, styleName)
	{
		Reflect.setField(context.node.style, styleName, null);
	}
	
	function toggleStyle(context, styleName, value)
	{
		if (Reflect.field(context.node.style, styleName) != "")
		{
			
			removeStyle(context, styleName);
		}
		else
		{
			setStyle(context, styleName, value);
		}
	}
	
	//////////////////
	// BRIX CLASS METHODS
	/////////////////
	
	function addClass(context, name)
	{
		var element:HtmlDom = context.node;
		var className = name;
		
		if (element.className == null) element.className = "";
		Lambda.iter( className.split(" "), function(cn:String) { if (!Lambda.has(element.className.split(" "), cn)) { if (element.className != "") { element.className += " "; } element.className += cn; } } );
	}
	
	function removeClass(context, name)
	{
		var element:HtmlDom = context.node;
		var className = name;
		
		if (element.className == null || element.className.trim() == "") return;

		var classNamesToKeep:Array<String> = new Array();
		var cns = className.split(" ");

		Lambda.iter( element.className.split(" "), function(ecn:String) { if (!Lambda.has(cns, ecn)) { classNamesToKeep.push(ecn); } } );

		element.className = classNamesToKeep.join(" ");
	}
	
	function toggleClass(context, name:String) 
	{
		var element:HtmlDom = context.node;
		var className = name;
		
		if(hasClass(element, className))
			removeClass(context, className);
		else
			addClass(context, className);
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