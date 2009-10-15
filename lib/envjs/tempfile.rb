require 'tempfile'

module Envjs; end

class Envjs::TempFile < Tempfile

  def initialize pattern, suffix = nil
    super(pattern)

    if suffix
      File.link path, ( path + "." + suffix )
      File.unlink path
    end

    @suffix = suffix
  end

  def path
    @suffix ? ( super + "." + @suffix ) : super
  end

  def getAbsolutePath
    path
  end

end
