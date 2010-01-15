#!/usr/bin/env watchr

begin; require 'watchr/event_handlers/em'; rescue LoadError; end
begin; require 'watchr/deps'; rescue LoadError; end

watch( %r(.*), :modified, lambda { |md| File.directory? md[0] } ) do |md|
  File.directory? md[0] and raise Watchr::Refresh
end

watch( %r(env-js.watchr), :modified ) do |md|
  raise Watchr::Refresh
end

watch( %r((^src/.*)\.js$), [:load, :created, :modified], nil, :batch => :js ) do
  cmd = "rake johnson:compile"
  puts cmd
  system cmd
end

Signal.trap('QUIT') do
  EM.stop
end

# Local Variables:
# mode:ruby
# End:
