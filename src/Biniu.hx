package ;

import js.Dom;
import js.Lib;

/**
 * A simple interpreter for expressions meant to be binded to 
 * dom events
 * 
 * @author Yannick DOMINGUEZ
 */
class Biniu 
{

	static function main() 
	{
		Lib.window.onload = function(e)
		{
			var b = new Biniu();
			b.run(untyped Lib.document.documentElement);
		}
	}
	
	/**
	 * prefix for biniu attribute, must be appended with an
	 * event name
	 */
	static var BINIU_PREFIX:String = "data-biniu";
	
	/**
	 * start of a list
	 */
	static var BINIU_OPEN:String = "(";
	
	/**
	 * end of a list
	 */
	static var BINIU_CLOSE:String = ")";
	
	public function new() 
	{
		
	}
	
	/**
	 * register all event callbacks for dom node 
	 * with biniu attributes
	 */
	public function run(node:HtmlDom, userCallbacks:Dynamic = null)
	{
		var biniuCallbacks = getBiniuCallbacks(userCallbacks);
		
		var biniuNodes:Array<HtmlDom> = getBiniuNodes(node);
		
		for (biniuNode in biniuNodes)
		{
			for (biniuAttr in getBiniuAttributes(biniuNode))
			{
				registerBiniu(biniuNode, biniuAttr, biniuCallbacks);
			}
		}
	}
	
	/**
	 * get all the dom node with a biniu attribute
	 */
	function getBiniuNodes(node:HtmlDom):Array<HtmlDom>
	{
		var biniuNodes = [];
		for (i in 0...node.childNodes.length)
		{
			if (getBiniuAttributes(node.childNodes[i]).length > 0)
			{
				biniuNodes.push(node.childNodes[i]);
			}
			
			var childBiniuNodes = getBiniuNodes(node.childNodes[i]);
			for (j in 0...childBiniuNodes.length)
			{
				biniuNodes.push(childBiniuNodes[j]);
			}
		}
		return biniuNodes;
	}
	
	/**
	 * register a callback for the event type specified by the biniu attribute
	 */
	function registerBiniu(biniuNode:HtmlDom, biniuAttr:String, biniuCallbacks:Dynamic)
	{
		var eventType = getBiniuEventType(biniuAttr);
		var biniuExpr = biniuNode.getAttribute(biniuAttr);
		
		var node:Dynamic = biniuNode;
		
		node.addEventListener(eventType, function(e) { 
			
			//context pasd to all callbacks when executed
			var context = {
				node:node,
				event:e
			}
			
			executeBinius(biniuExpr, context, biniuCallbacks); });
	}
	
	/**
	 * execute all the comma separated command
	 */
	function executeBinius(binius:String, context, biniuCallbacks)
	{
		for (biniu in binius.split(","))
		{
			executeBiniu(parseBiniu(biniu), context, biniuCallbacks);
		}
	}
	
	/**
	 * parse and sanitize biniu expr, return
	 * array of space separated tokens
	 */
	function parseBiniu(biniu:String)
	{
		var components:Array<String> = biniu.split(" ");
		
		var ret:Array<String> = [];
		for (i in 0...components.length)
		{
			components[i] = StringTools.trim(components[i]);
			components[i]  = StringTools.replace(components[i], '\n', '');
			components[i]  = StringTools.replace(components[i], '\r', '');
			components[i]  = StringTools.replace(components[i], '\t', '');
			
			if (components[i] != "")
			{
				ret.push(components[i]);
			}
			
		}
		
		return ret;
	}
	
	/**
	 * execute one biniu expression
	 */
	function executeBiniu(components:Array<String>, context:Dynamic, biniuCallbacks:Dynamic)
	{
		
		//always start with a method
		if (!Reflect.hasField(biniuCallbacks, components[0]))
		{
			throw "first value must be a registered method";
		}
		
		//method to call
		var func = Reflect.field(biniuCallbacks, components.shift());
		
		var resolvedArgs = [];

		while (components.length > 0)
		{
			var component = components.shift();
			
			//special triggering method call using all the rest of the arguments
			if (component == BINIU_OPEN)
			{
				var local = [];
				
				while (components.length > 0)
				{
					var component = components.shift();
					
					if (component == BINIU_CLOSE)
					{
						break;
					}
					
					local.push(component);
				}
				
				resolvedArgs.push(executeBiniu(local, context, biniuCallbacks));
			}
			//resolve every argument
			else if (component != BINIU_CLOSE)
			{
				resolvedArgs.push(resolveArgument(component, context, biniuCallbacks));
			}
		}
		
		//call with resolved arg
		return Reflect.callMethod(biniuCallbacks, func, [context, resolvedArgs]);
	}
	
	/**
	 * Resolve the actual value of an argument using the following rules :
		 * first if arg is a registered func, return the func
		 * then if it is a field of the event return the value of the field
		 * then if it is an attribute of the node return the value of the attribute
		 * then return the argument as is
	 */
	function resolveArgument(argument, context, biniuCallbacks):Dynamic
	{
		if (Reflect.hasField(biniuCallbacks, argument))
			return Reflect.field(biniuCallbacks, argument);
			
		if (Reflect.hasField(context.event, argument))
			return Reflect.field(context.event, argument);
		
		//special case for custom event
		if (context.event.detail != null)
		{
			if (Reflect.hasField(context.event.detail, argument))
				return Reflect.field(context.event.detail, argument);
		}
			
		if (context.node.getAttribute(argument) != null)
			return context.node.getAttribute(argument);
			
		return argument;	
	}
	
	/**
	 * return the event targeted by the biniu
	 */
	function getBiniuEventType(biniuAttr):String
	{
		var components:Array<String> = biniuAttr.split("-");
		return components[components.length - 1];
	}
	
	/**
	 * Return all the names of attributes with biniu prefix 
	 * on the current node
	 */
	function getBiniuAttributes(biniuNode:Dynamic):Array<String>
	{
		if (biniuNode.attributes == null)
			return [];
			
		var attributes = [];
		
		for (i in 0...biniuNode.attributes.length)
		{
			if (biniuNode.attributes.item(i).name.indexOf('data-biniu') != -1)
			{
				attributes.push(biniuNode.attributes.item(i).name);
			}
		}
		return attributes;
	}
	
	/**
	 * concatenate standard callbacks with user callbacks
	 */
	function getBiniuCallbacks(userCallbacks:Dynamic)
	{
		var biniuCallbacks = new Biniulib().map;
		
		if (userCallbacks == null)
			return biniuCallbacks;
			
			
		for (userCallback in Reflect.fields(userCallbacks))
		{
			Reflect.setField(biniuCallbacks, userCallback, Reflect.field(userCallbacks, userCallback));
		}
		
		return biniuCallbacks;
	}
	

}