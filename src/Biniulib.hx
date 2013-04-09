package ;

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
			'log':log
		}
	}
	
	function log(context, msg)
	{
		trace(msg);
	}
	
}