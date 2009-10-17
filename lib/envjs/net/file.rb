require 'net/protocol'

require 'envjs/net'

class Envjs::Net::File < Net::Protocol

  class Get
    attr_accessor :path
    def initialize path
      @path = path
    end
  end

  def initialize host, port
  end

  def self.start host, port
    new( host, port ).start
  end

  def start
    self
  end

  class Response
    def initialize path
      @path = path
      @file = File.new @path
    end

    def getHeaderFields
      []
    end

    def getContentEncoding
      nil
    end

    def getResponseCode
      @file.nil? ? 404 : 200;
    end

    def getInputStream
      @file
    end

  end

  def request request
    Response.new request.path
  end

end
