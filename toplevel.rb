module MyModule
  def self.cfunc()
    puts "cf"
  end
  def ifunc()
    puts "if"
  end
end

class MyClass
  extend MyModule
end 

p MyClass.singleton_methods
p MyClass.ifunc

Object.extend MyModule

String.ifunc

p self.object_id
p Object.object_id

=begin
RubyのtoplevelにおいてカレントクラスはObjectであり、カレントオブジェクトはObjectのインスタンスであるmain
である

includeはクラスをレシーバとして直近の親として継承階層にはいる

extendはインスタンス/クラスをレシーバとして特異クラスにModuleの機能を追加する

module_functionはModule内のインスタンスメソッドを特異メソッドにコピーし、
インスタンスメソッドをprivateにする機能性

Moduleの特異メソッドはincludeやextendで追加すべきでは無さそう

=end
