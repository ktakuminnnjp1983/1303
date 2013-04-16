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
Ruby��toplevel�ɂ����ăJ�����g�N���X��Object�ł���A�J�����g�I�u�W�F�N�g��Object�̃C���X�^���X�ł���main
�ł���

include�̓N���X�����V�[�o�Ƃ��Ē��߂̐e�Ƃ��Čp���K�w�ɂ͂���

extend�̓C���X�^���X/�N���X�����V�[�o�Ƃ��ē��كN���X��Module�̋@�\��ǉ�����

module_function��Module���̃C���X�^���X���\�b�h����ك��\�b�h�ɃR�s�[���A
�C���X�^���X���\�b�h��private�ɂ���@�\��

Module�̓��ك��\�b�h��include��extend�Œǉ����ׂ��ł͖�������

=end
