require 'envjs'
require "open-uri"

module Envjs::Runtime

  def self.extended object
    object.instance_eval do

      evaluate <<'EOJS'
print = function() {
  var l = arguments.length
  for( var i = 0; i < l; i++ ) {
    var s;
    if ( arguments[i] === null ) {
      s = "null";
    } else if ( arguments[i] === undefined  ) {
      s = "undefined"      
    } else {
      s = arguments[i].toString();
    }
    Ruby.print(s);
    if( i < l-1 ) {
      Ruby.print(" ");
    }
  }
  Ruby.print("\n");
};
EOJS

      evaluate <<'EOJS'
debug = function() {
  var l = arguments.length
  for( var i = 0; i < l; i++ ) {
    var s;
    if ( arguments[i] === null ) {
      s = "null";
    } else if ( arguments[i] === undefined  ) {
      s = "undefined"      
    } else {
      s = arguments[i].toString();
    }
    Ruby['$stderr'].print(s);
    if( i < l-1 ) {
      Ruby['$stderr'].print(" ");
    }
  }
  Ruby['$stderr'].print("\n");
};
EOJS

      evaluate <<'EOJS'
puts = function() {
  var l = arguments.length
  for( var i = 0; i < l; i++ ) {
    var s;
    if ( arguments[i] === null ) {
      s = "null";
    } else if ( arguments[i] === undefined  ) {
      s = "undefined"      
    } else {
      s = arguments[i].toString();
    }
    Ruby.print(s);
    Ruby.eval("$stdout.flush")
  }
};
EOJS

      master = global["$master"] = evaluate("new Object")
      master.symbols = [ "Johnson", "Ruby", "print", "debug", "puts", "load", "whichInterpreter", "multiwindow" ]
      master.symbols.each { |symbol| master[symbol] = global[symbol] }

      master.whichInterpreter = "Johnson"

      master.multiwindow = true

      # calling this from JS is hosed; the ruby side is confused, maybe because HTTPHeaders is mixed in?
      master.add_req_field = lambda { |r,k,v| r.add_field(k,v) }

      master.load = lambda { |*files|
        if files.length == 2 && !(String === files[1])
          f = files[0]
          w = files[1]
          v = open(f).read.gsub(/\A#!.*$/, '')
          evaluate(v, f, 1, w, w, f)
        else
          load *files
        end
      }

      master.evaluate = lambda { |v,w|
        evaluate(v,"inline",1,w,w);
      }

      master.new_split_global_outer = lambda { new_split_global_outer }
      master.new_split_global_inner = lambda { |outer,_| new_split_global_inner outer }

      # create an proto window object and proxy

      outer = new_split_global_outer
      window = inner = new_split_global_inner( outer )

      master.symbols.each do |symbol|
        window[symbol] = master[symbol]
      end

      master.first_script_window = window

      window["$master"] = master
      window["$options"] = evaluate("new Object");
      window["$options"].proxy = outer

      window.load = lambda { |*files|
        files.each do |f|
          master.load.call f, window
        end
      }

      ( class << self; self; end ).send :define_method, :wait do
        master["finalize"] && master.finalize.call
        master.timers && master.timers.wait
      end

      scripts = {}

      ( class << self; self; end ).send :define_method, :become_first_script_window do
        # p "heh", inner, master.first_script_window
        inner = master.first_script_window
      end

      ( class << self; self; end ).send :define_method, :evaluate do |*args|
        ( script, file, line, global, scope, fn ) = *args
        # print "eval in " + script[0,50].inspect + (scope ? scope.toString() : "nil") + "\n"
        global = nil
        scope ||= inner
        if fn
          compiled_script = scripts[fn]
        end
        # compiled_script = compile(script, file, line, global)
        compiled_script ||= compile(script, file, line, global)
        if fn && !scripts[fn]
          scripts[fn] = compiled_script
        end
        evaluate_compiled_script(compiled_script,scope)
      end

      @envjs = inner

      ( class << self; self; end ).send :define_method, :"[]" do |key|
        key == "this" && evaluate("this") || @envjs[key]
      end

      ( class << self; self; end ).send :define_method, :"[]=" do |k,v|
        @envjs[k] = v
      end

    end
  end

end
