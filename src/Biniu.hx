package ;

import js.Dom;
import js.Lib;

/**
 * ...
 * @author Yannick DOMINGUEZ
 */

class Biniu 
{

	static function main() 
	{
		Lib.window.onload = function(e)
		{
			var b = new Biniu();
			b.run();
		}
	}
	
	public function new() 
	{
		
	}
	
	public function run(userCallbacks:Dynamic = null)
	{
		var biniuCallbacks = getBiniuCallbacks(userCallbacks);
		
		var biniuNodes:Array<HtmlDom> = getBiniuNodes(untyped Lib.document.documentElement);
		
		for (biniuNode in biniuNodes)
		{
			for (biniuAttr in getBiniuAttributes(biniuNode))
			{
				registerBiniu(biniuNode, biniuAttr, biniuCallbacks);
			}
		}
	}
	
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
	
	function registerBiniu(biniuNode:HtmlDom, biniuAttr:String, biniuCallbacks:Dynamic)
	{
		var eventType = getBiniuEventType(biniuAttr);
		var biniuExpr = biniuNode.getAttribute(biniuAttr);
		
		var node:Dynamic = biniuNode;
		node.addEventListener(eventType, function(e) { executeBiniu(biniuExpr, biniuNode, e, biniuCallbacks); } );
	}
	
	function executeBiniu(biniuExpr, node, event, biniuCallbacks)
	{
		var commands:Array<String> = biniuExpr.split(",");
		
		for (command in commands)
		{
			var components = command.split(" ");
			if (!Reflect.hasField(biniuCallbacks, components[0]))
				throw "first value must be a registered method";
			
			var func = Reflect.field(biniuCallbacks, components[0]);
			var resolvedArgs = [];	
			for (i in 0...components.length)
			{
				if (i != 0)
				{
					resolvedArgs.push(resolveArgument(components[i], node, event, biniuCallbacks));
				}
			}
			trace(resolvedArgs);
			trace(components);
			Reflect.callMethod(biniuCallbacks, func, resolvedArgs);
		}
	}
	
	function resolveArgument(argument, node, event, biniuCallbacks):Dynamic
	{
		if (Reflect.hasField(biniuCallbacks, argument))
			return Reflect.field(biniuCallbacks, argument);
			
		if (Reflect.hasField(event, argument))
			return Reflect.field(event, argument);
			
		if (node.getAttribute(argument) != null)
			return node.getAttribute(argument);
			
		return argument;	
	}
	
	function getBiniuEventType(biniuAttr):String
	{
		var components:Array<String> = biniuAttr.split("-");
		return components[components.length - 1];
	}
	
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
	
	function getBiniuCallbacks(userCallbacks:Dynamic)
	{
		var biniuCallbacks = {'add':add };
		
		if (userCallbacks == null)
			return biniuCallbacks;
			
			
		for (userCallback in Reflect.fields(userCallbacks))
		{
			Reflect.setField(biniuCallbacks, userCallback, Reflect.field(userCallbacks, userCallback));
		}
		
		return biniuCallbacks;
	}
	
	function add(a, b)
	{
		var c:Int = Std.parseInt(a) + Std.parseInt(b);
		trace(c);
	}
}