# task :default => "rhino:test"
task :default => "johnson:test"

namespace :rhino do
  desc "run tests aginst rhino"
  task :test do
    classpath = [
        File.join(".", "rhino", "ant.jar"), 
  	File.join(".", "rhino", "ant-launcher.jar")
    ].join(File::PATH_SEPARATOR)
    exec "java -cp #{classpath} org.apache.tools.ant.Main -emacs all"
  end
end

task :test => "rhino:test"

namespace :johnson do

  desc "create a file that loads the individual source files"
  task :load

  desc "compile johnson files into a single js file"
  task :compile do
    require 'rexml/document'
    include REXML
    doc = Document.new( File.new( "build.xml" ) ).root
    groups = {}
    XPath.each( doc, "//concat" ) do |concat|
      name = concat.attributes["destfile"]
      files =
        XPath.match( concat, "fileset/attribute::includes" ).
          map { |a| a.value }
      files.reject! { |f| f == "env.js" }
      groups[name] = files
    end

    files = groups["${ENV_RHINO}"] + groups["${ENV_DIST}"] 

    files.map! { |f| f.sub!( "rhino", "johnson" ); "src/" + f }

    system "rm -f dist/env.johnson.js"
    system "cat #{files.join(' ')} > dist/env.johnson.js"
    system "chmod 444 dist/env.johnson.js"

  end

  desc "run tests against johnson"
  task :test => :compile do
    ruby "-Ilib:vendor/johnson/lib bin/envjsrb test/primaryTests.js"
  end

end

desc "run tests on all platforms"
task :test => "rhino:test"
task :test => "johnson:test"

begin
  require 'jeweler'
  Jeweler::Tasks.new do |s|
    s.name = "envjs"
    s.executables = "envjsrb"
    s.summary = "Browser environment for javascript interpreters"
    s.email = "smparkes@smparkes.net" # Just for the ruby part ...
    s.homepage = "http://github.com/thatcher/env-js"
    s.description = "Browser environment for javascript interpreters"
    s.authors = ["John Resig", "Chris Thatcher", "Glen E. Ivey" ]
    s.files = 
      FileList[ "",
                "{bin,generators,lib,test}/**/*", 'lib/jeweler/templates/.gitignore']
  end
rescue LoadError
  puts "Jeweler, or one of its dependencies, is not available. Install it with: sudo gem install technicalpickles-jeweler -s http://gems.github.com"
end

# Local Variables:
# mode:ruby
# End:
