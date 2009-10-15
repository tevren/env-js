module Envjs; end

module Envjs::Runtime

  def self.extended object
    object.instance_eval do

      global_proto = global

      set_window_string =
        evaluate("function(o,id){o.toString=function(){return'[object Window '+id+']'}}")

      evaluate <<'EOJS'
print = function() {
  var l = arguments.length
  for( var i = 0; i < l; i++ ) {
    Ruby.print( arguments[i].toString() );
    if( i < l-1 ) {
      Ruby.print(" ");
    }
  }
  Ruby.print("\n");
};
EOJS

      self.global = new_global( global_proto )

      set_window_string.call(global,global.object_id)

      global_proto.globalize = lambda do
        g = new_global global_proto
        set_window_string.call(g,g.object_id)
        $stderr.print "kkkk ng ", global_proto, "\n"
        $stderr.print "kkkk ng ", evaluate("this"), "\n"
        $stderr.print "kkkk ng ", g, "\n"
        g
      end

      global_proto.setScope = lambda do |f, scope|
        prev = f
        cur = get_parent( f )
        while _next = get_parent( cur )
          prev = cur
          cur = _next
        end
        set_parent( prev, scope )
      end

      global_proto.getScope = lambda do |f, nothing|
        cur = f
        while prev = get_parent( cur )
          cur = prev
        end
        cur
      end

      global_proto.configureScope = lambda do |f, scopes|
        pairs = [ [ f, get_parent( f ) ] ]
        set_parent( f, scopes[0] )
        scopes.each_with_index do |scope, i|
          pairs << [ scope, get_parent( scope ) ]
          set_parent( scope, scopes[i+1] )
        end
        pairs
      end

      global_proto.restoreScope = lambda do |scopes|
        scopes.each do |pair|
          set_parent( pair[0], pair[1] )
        end
      end
      
      global_proto.load = lambda do |f|
        self.require f
      end

    end
  end

end
