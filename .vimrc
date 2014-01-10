" init {{{

"init
"コマンド	                 検出	  プラグイン	インデント
":filetype on	             有効	  変化なし	    変化なし
":filetype off	             無効	  変化なし	    変化なし
":filetype plugin on	     有効	  有効	        変化なし
":filetype plugin off	     変化なし 無効	        変化なし
":filetype indent on	     有効	  変化なし	    有効
":filetype indent off	     変化なし 変化なし	    無効
":filetype plugin indent on	 有効	  有効	        有効
":filetype plugin indent off 変化なし 無効	        無効

set nocompatible
autocmd!
filetype off
filetype plugin indent off

set runtimepath&
set path&

set path+=$SPIDER_HOME/include/
set path+=./
set wildmenu wildmode=list:full

"}}}

" plugin management {{{

"Vandle git clone http://github.com/gmarik/vundle.git ~/.vim/vundle
set runtimepath+=~/.vim/bundle/vundle/
call vundle#rc()
Bundle 'gmarik/vundle'
"Bundle 'tpope/vim-fugitive' "Gitを便利に使える
"Bundle 'Lokaltog/vim-easymotion'
Bundle 'EasyMotion'
"Bundle 'rstacruz/sparkup', {'rtp': 'vim/'}
"Bundle 'tpope/vim-rails.git'
"Bundle 'L9'
"Bundle 'FuzzyFinder'
"Bundle 'git://git.wincent.com/command-t.git'
"Bundle 'neocomplcache-snippets_complete'
Bundle 'quickrun.vim'
Bundle 'Cpp11-Syntax-Support'
Bundle 'taglist.vim'
Bundle 'JavaScript-Indent'
Bundle 'surround.vim'
Bundle 'SrcExpl'
Bundle 'Trinity'
Bundle 'TagHighlight'
Bundle 'srking/ag.vim'
Bundle 'Shougo/neobundle.vim'
"https://github.com/scrooloose/nerdtree
"grep 可能にしてみたhttps://gist.github.com/masaakif/414375
Bundle 'scrooloose/nerdtree'
if has('vim_starting')
  set runtimepath+=~/.vim/bundle/neobundle.vim
  call neobundle#rc(expand('~/.vim/bundle/'))
endif
NeoBundle 'Shougo/unite.vim'
NeoBundle 'Shougo/vimproc'
NeoBundle 'Shougo/vimshell'
NeoBundle 'Shougo/vimfiler'
NeoBundle 'Shougo/neocomplcache'
NeoBundle 'Shougo/neosnippet'
NeoBundle 'Shougo/unite-build'
NeoBundle 'tacroe/unite-mark'
NeoBundle 'kmnk/vim-unite-svn'
NeoBundle 'sjl/gundo.vim'
NeoBundle 'scrooloose/nerdcommenter'
NeoBundle 'scrooloose/syntastic'
NeoBundle 'vim-scripts/jshint.vim'
NeoBundle 'vim-jp/vimdoc-ja'
NeoBundle 'kana/vim-gf-user'
NeoBundle 'sgur/vim-gf-autoload'
NeoBundle 'osyo-manga/unite-fold'
NeoBundle 'tpope/vim-fugitive'
NeoBundle 'zhaocai/unite-scriptnames'
NeoBundle 'basyura/unite-matchers'
NeoBundle 'vim-jp/cpp-vim'
NeoBundle 'itchyny/lightline.vim'
NeoBundle 'vim-scripts/vim-auto-save'
NeoBundle 'vim-scripts/vcscommand.vim'
" }}}

" plugin config {{{

"neocomplcache設定
"http://vim-users.jp/2010/10/hack177/
let g:neocomplcache_enable_at_startup = 1
let g:neocomplcache_enable_smart_case = 1
let g:neocomplcache_enable_camel_case_completion = 1
let g:neocomplcache_enable_underbar_completion = 1
let g:neocomplcache_min_syntax_length = 4
 
"unitesetup
 "最近開いたファイル履歴の保存数
let g:unite_source_file_mru_limit = 1000
let g:unite_source_grep_max_candidates = 1000
"file_mruの表示フォーマットを指定。空にすると表示スピードが高速化される
let g:unite_source_file_mru_filename_format = ''
"インサートモードで開始
let g:unite_enable_start_insert = 0
let g:unite_source_history_yank_enable = 1
call unite#custom#source('file_mru', 'converters', ["converter_file_directory"])
" unite vimgrep ag
let g:unite_source_grep_command = 'ag'
let g:unite_source_grep_default_opts = '-S  --nocolor --nogroup'

" NERDCommenter設定
"let g:NERDCreateDefaultMappings = 0
let NERDSpaceDelims = 1
" call s:CreateMaps('nx', 'Comment',    'Comment', 'cc')
" call s:CreateMaps('nx', 'Toggle',     'Toggle', 'c<space>')
" call s:CreateMaps('nx', 'Minimal',    'Minimal', 'cm')
" call s:CreateMaps('nx', 'Nested',     'Nested', 'cn')
" call s:CreateMaps('n',  'ToEOL',      'To EOL', 'c$')
" call s:CreateMaps('nx', 'Invert',     'Invert', 'ci')
" call s:CreateMaps('nx', 'Sexy',       'Sexy', 'cs')

" syntastic設定
" let g:syntastic_enable_signs = 1
" let g:syntastic_auto_loc_list = 2
let g:syntastic_mode_map = { 'mode': 'passive',
  \ 'active_filetypes': [],
  \ 'passive_filetypes': [] }
let g:syntastic_auto_loc_list = 1
let g:syntastic_javascript_checkers = ['jshint']

"easymotion" Lokaltog/vim-easymotion
" ホームポジションに近いキーを使う
let g:EasyMotion_keys='hjklasdfgyuiopqwertnmzxcvbHJKLASDFGYUIOPQWERTNMZXCVB'
" 「;」 + 何かにマッピング
let g:EasyMotion_leader_key="\\"
" 1 ストローク選択を優先する
let g:EasyMotion_grouping=1
" カラー設定変更
hi EasyMotionTarget cterm=reverse ctermbg=none ctermfg=red
hi EasyMotionShade  cterm=reverse ctermbg=none ctermfg=blue

" VimShell
let g:vimshell_prompt = "% "
let g:vimshell_secondary_prompt = "> "
let g:vimshell_user_prompt = 'getcwd()'

" SuperTab like snippets behavior.
" :BundleList          - list configured bundles
" :BundleInstall(!)    - install(update) bundles
" :BundleSearch(!) foo - search(or refresh cache first) for foo
" :BundleClean(!)      - confirm(or auto-approve) removal of unused bundles
"
" see :h vundle for more details or wiki for FAQ
" NOTE: comments after Bundle command are not allowed..
"
" auto saveを有効に
let g:auto_save = 1

" }}}

" general config {{{

filetype on
filetype plugin indent on     
syntax on "強調表示(色付け)のON/OFF設定

" %を強化する
source $VIMRUNTIME/macros/matchit.vim

" 色数
set t_Co=256

"View
colorscheme hybrid
set number "行番号を表示する
set title "ウィンドウのタイトルを変更する設定
set ruler "カーソルが何行目の何列目に置かれているかを表示する

" backspace config
set backspace=indent,eol,start "backspaceで何でも消す

"indent 
set tabstop=4
set autoindent
set expandtab
set shiftwidth=4

"無限undo
if has('persistent_undo')
    set undodir=~/.vim/undo
    set undofile
endif

"file
set hidden "編集中でも他のファイルに移動可能
set noswapfile
set nobackup

" foldmethod
set foldmethod=marker

"前回の作業位置を復元
augroup restre_cursor_pos
    autocmd!
    autocmd BufReadPost * if line("'\"") > 1 && line("'\"") <= line("$") | exe "normal! g`\""
augroup END

"Search
set ignorecase "検索で、大文字小文字を区別しない
set smartcase "検索で小文字なら大文字を無視、大文字なら無視しない設定
set wrapscan "検索をファイルの末尾まで検索したら、ファイルの先頭へループする
set hlsearch "検索結果をハイライトする
set incsearch "インクリメンタルサーチ

"mouse on
set mouse=a

"wrap
set nowrap

"clipboard
set clipboard&
set clipboard+=unnamed
    
"開いたファイルがあるdirectoryをcurrent directoryに 
augroup set_current_dir_by_opend_file
    autocmd!
    autocmd BufEnter * execute ':silent! lcd' fnameescape(expand('%:p:h'))
augroup END

" 特定のcommand実行時にquickfixを開くmodifiableに
function! OpenQF()
    cw
    set modifiable
    set nowrap
endfunction
augroup open_with_quickfix
    autocmd!
    autocmd QuickfixCmdPost grep call OpenQF()
    autocmd QuickfixCmdPost vimgrep call OpenQF()
    autocmd QuickfixCmdPost make call OpenQF()
    autocmd QuickfixCmdPost jshint call OpenQF()
augroup END

"全角文字を強調表示
function! ZenkakuSpace()
    highlight ZenkakuSpace cterm=reverse ctermfg=DarkMagenta gui=reverse guifg=DarkMagenta
endfunction
if has('syntax')
    augroup ZenkakuSpace
        autocmd!
        autocmd ColorScheme * call ZenkakuSpace()
        autocmd BufEnter * match ZenkakuSpace /　/
    augroup END
    call ZenkakuSpace()
endif        

"ctags ルートで ctags -R * .tags生成
"set tags=.tags;
set tags=.tags;

" make 
set makeprg=env\ LANG=C\ make\ install

" statusline
set laststatus=2
" "statusline change when insert mode
" let g:hi_insert = 'highlight StatusLine guifg=darkblue guibg=darkyellow gui=none ctermfg=blue ctermbg=yellow cterm=none'
" if has('syntax')
    " augroup InsertHook
        " autocmd!
        " autocmd InsertEnter * call s:StatusLine('Enter')
        " autocmd InsertLeave * call s:StatusLine('Leave')
    " augroup END
" endif

" let s:slhlcmd = ''
" function! s:StatusLine(mode)
    " if a:mode == 'Enter'
        " silent! let s:slhlcmd = 'highlight ' . s:GetHighlight('StatusLine')
        " silent exec g:hi_insert
    " else
        " highlight clear StatusLine
        " silent exec s:slhlcmd
    " endif
" endfunction

" function! s:GetHighlight(hi)
    " redir => hl
    " exec 'highlight '.a:hi
    " redir END
    " let hl = substitute(hl, '[\r\n]', '', 'g')
    " let hl = substitute(hl, 'xxx', '', '')
    " return hl
" endfunction
" set statusline=%F%m%r%h%w\ [FORMAT=%{&ff}]\ [TYPE=%Y]\ [ASCII=\%03.3b]\ [HEX=\%02.2B]\ [POS=%04l,%04v][%p%%]\ [LEN=%L]

" " cindent
" augroup mycindent
    " au!
    " au FileType c,cpp set cindent
" augroup END

" }}}

" temp save {{{

"augroup myjscolorscheme
"    autocmd!
"    "autocmd BufRead * :colorscheme risto "default color 
"    colorscheme hybrid
"augroup END
"罫線をcurrent windowにのみ表示
"augroup cch
"  autocmd!
"  autocmd WinLeave * set nocursorline
"  "カーソルラインはカーソル移動速度が遅くなる
"  "autocmd WinLeave * set nocursorcolumn
"  autocmd WinEnter,BufRead * set cursorline
"  "autocmd WinEnter,BufRead * set cursorcolumn
"augroup END
augroup mycppsyntax
    autocmd!
    "autocmd BufNewFile,BufRead *.cpp setf cpp
augroup END

" }}}

" my commands {{{

" cursorの下の単語を:helpで検索する
function! ShowHelpOnWord()
    let word = expand("<cword>")
    exec ":h " . word
endfunction
command! ShowHelpOnWord :call ShowHelpOnWord()
function! ShowHelpOnWordV() range
    let tmp = @@
    silent normal gvy "gv は最後に選択していた範囲を復元する
    let selected = @@
    let @@ = tmp
    exec ":h " . selected
endfunction
command! -range ShowHelpOnWordV :call ShowHelpOnWordV()

" vimprocで結果を変数に代入
" http://vim-users.jp/2010/08/hack168/
" cursorの下の単語にresourcepickerを実行
" arg type(t, i), locale(ja_JP, en_US)
function! ResourcePicker(...)
    if a:0 != 2
        echo "arg error. input type and locale"
        return 
    endif
    
    let type = ""
    if a:1 == "t"
        let type = "-t"
    else
        let type = "-i"
    endif
   
    let locale = ""
    if a:2 == ""
        let locale = "ja_JP"
    else
        let locale = a:2 
    endif
    
    let id = expand("<cword>")
    let cmd = "resourcepicker " . type . " -l " . locale . " " . id
    let res = vimproc#system(cmd)
    echo res
endfunction
command! -nargs=* ResourcePicker :call ResourcePicker(<f-args>)

" }}}

" keymaps {{{

"nnoremap ; 0i<CR><ESC>k
nnoremap <enter> i<CR><ESC>
nnoremap <C-h> 5zh
nnoremap <C-l> 5zl
nnoremap <C-j> <C-e>
nnoremap <C-k> <C-y>
nnoremap Y y$
nnoremap <C-p> "0p
nnoremap M :set modifiable!<CR>
nnoremap <C-]> g<C-]>
nnoremap gr :Unite grep:.<CR>
nnoremap fi :Unite find:.<CR>
nnoremap ba :UniteBookmarkAdd<CR>
nnoremap vs :VimShell -split<CR>
nnoremap <Space>t :Tlist<CR>
nnoremap <Space>n :NERDTreeToggle<CR>
nnoremap <Space>h :e %:r.h<CR>
nnoremap <Space>c :e %:r.cpp<CR>
nnoremap <Space>b :Unite buffer<CR>
nnoremap <Space>r :Unite register<CR>
nnoremap <Space>l :Unite file_mru -truncate<CR>
nnoremap <Space>d :Unite directory_mru -default-action=vimfiler<CR>
"nnoremap <Space>D :UniteWithBufferDir -buffer-name=files file<CR>
nnoremap <Space>s :Unite bookmark -default-action=vimfiler<CR>
nnoremap <Space>y :Unite history/yank<CR>
nnoremap <Space>m :Unite mark<CR>
nnoremap <Space>S :Unite svn/status<CR>
nnoremap <Space>L :VCSLog<CR>
nnoremap <Space>D :!svn diff<CR>
nnoremap <Space>u :GundoToggle<CR>
nnoremap <Space>f :VimFilerCurrentDir <CR>
nnoremap <Space>e :e .<CR>
nnoremap <Space>B :buffers<CR>
nnoremap <Space>R :ResourcePicker t ja_JP<CR>
nnoremap <Space>F :Unite file<CR>
nnoremap <Space>H :ShowHelpOnWord<CR>
nnoremap <Space>uf :Unite fold<CR>
nnoremap <Space>ur :Unite file_rec<CR>
" カーソル位置の単語をgrep検索
nnoremap <Space>gr :<C-u>Unite grep:. -buffer-name=search-buffer<CR><C-R><C-W><CR>
nnoremap <C-@> :<Up><CR>
nnoremap <C-a> <HOME>
nnoremap <C-e> <END>
nnoremap :w :w<CR>
nnoremap cs :SyntasticCheck<CR>
nnoremap ma :Unite build:! -default-action=preview -auto-highlight<CR>
"vimrc 編集、適用
nnoremap <Space>v :e $VIMRC<CR>
nnoremap <Space>V :source $VIMRC<CR>

"insert mode
"カーソル移動
"inoremap <C-j> <Down>
"inoremap <C-k> <Up>
inoremap <C-h> <Left>
inoremap <C-l> <Right>
inoremap <C-a> <HOME>
inoremap <C-e> <END>
"insert mode 抜ける
inoremap jj <ESC>
"insert mode かっこ
"inoremap { {}<LEFT>
"inoremap ( ()<LEFT>
inoremap :w <ESC>:w<CR>
"command mode
"emacs風
cnoremap <C-a> <HOME>
cnoremap <C-e> <END>

"visual mode
vnoremap <Space>H :ShowHelpOnWordV<CR>
"vnoremap <Space>H :<C-u>h <C-R>*<CR>
vnoremap <Space>gr :<C-u>Unite grep:. -buffer-name=search-buffer<CR><C-R>*<CR>

"for snippets
" Plugin key-mappings.
imap <C-k>     <Plug>(neosnippet_expand_or_jump)
smap <C-k>     <Plug>(neosnippet_expand_or_jump)
xmap <C-k>     <Plug>(neosnippet_expand_target)
" SuperTab like snippets behavior.
imap <expr><TAB> neosnippet#expandable_or_jumpable() ? "\<Plug>(neosnippet_expand_or_jump)" : pumvisible() ? "\<C-n>" : "\<TAB>"
smap <expr><TAB> neosnippet#expandable_or_jumpable() ? "\<Plug>(neosnippet_expand_or_jump)" : "\<TAB>"

" }}}

" test general {{{
let g:mysc_hstate = 0
function! ToggleTest()
    if g:mysc_hstate == 1
        let g:mysc_hstate = 0
        call unite#custom#source('file_mru', 'converters', ["converter_file_directory"])
        echo "hage"
    else
        let g:mysc_hstate = 1
        call unite#custom#source('file_mru', 'converters', ["converter_smart_path"])
        echo "gori"
    endif
endfunction

command! Testecho :call test#Testecho()
"test keymap
nnoremap <Space>T :call ToggleTest()<CR>
"autoload test
nnoremap <Space>Te :call test#Testecho()<CR>
" }}}

" ruby test {{{

" https://sites.google.com/site/hymd3a/vim/vim-ruby-interface
" ruby interface
function! VRtest1()
ruby << EOC
    require "date"
    print Date.today.to_s
EOC
endfunction
"call VRtest1()

function! VRtest2()
ruby << EOC
    require "date"
    buf = VIM::Buffer.current
    buf.append(buf.count, Date.today.to_s)
EOC
endfunction
"call VRtest2()

function! VRtest3(str)
ruby << EOC
    buf = VIM::Buffer.current
    buf.append(buf.count, VIM.evaluate('a:str'))
EOC
endfunction
" call VRtest3("hoge")

function! VRtest4(str)
    let num = 0
ruby << EOC
    result = eval(VIM.evaluate('a:str'))
    VIM.command("let num = #{result}")
EOC
    echo num
endfunction
" call VRtest4("1+2")

"}}}

" unite filters {{{

" :h unite-filters
" let s:filters = {
    " \   "name" : "converter_add_updatetime",
    " \   "description" : "add updatetime"
" \}
" function! s:filters.filter(candidates, context)
    " for candidate in a:candidates
        " let updatetime = strftime("(%Y/%m/%d %H:%M:%S) ", getftime(candidate.action__path))
        " " abbr に更新日を追加する
        " let candidate.abbr = updatetime . candidate.abbr
    " endfor
    " return a:candidates
" endfunction
" call unite#define_filter(s:filters)
" unlet s:filters

let s:filters = {
    \   "name" : "converter_add_updatetime",
    \   "description" : "add updatetime"
\}
function! s:filters.filter(candidates, context)
    for candidate in a:candidates
        echo candidate
        "let candidate.word = "gori"
        " let candidate.abbr = "hage"
        "let candidate.abbr = "aaa"
    endfor
    return a:candidates
endfunction
call unite#define_filter(s:filters)
unlet s:filters

" }}}

" unite source {{{

"http://d.hatena.ne.jp/thinca/20101105/1288896674
let s:unite_source = {
\   'name': 'lines',
\ }
function! s:unite_source.gather_candidates(args, context)
  let path = expand('#:p')
  let lines = getbufline('#', 1, '$')
  let format = '%' . strlen(len(lines)) . 'd: %s'
  return map(lines, '{
  \   "word": printf(format, v:key + 1, v:val),
  \   "source": "lines",
  \   "kind": "jump_list",
  \   "action__path": path,
  \   "action__line": v:key + 1,
  \ }')
endfunction
call unite#define_source(s:unite_source)
unlet s:unite_source

"call unite#custom#source('file', 'converters', ['converter_add_updatetime'])
call unite#custom#source('file_mru', 'matchers', ['matcher_file_name'])
""call unite#custom#source('file_mru', 'ignore_pattern', '\.svn-base$\|\.jax$')
""call unite#custom#source('file_rec', 'ignore_pattern', '\.d$\|\.jax$')
"let g:unite_source_rec_ignore_pattern = '\.d$\|\.jax$'
let g:unite_source_file_mru_ignore_pattern = '\.svn-base$\|\.jax$\|\.log\.\|\.log$\|COMMIT_EDITMSG' "おそらくmru.vimのデフォルト値おかしい
" call unite#custom#source('file_mru', 'ignore_pattern', unite#sources#mru#define()[0]['ignore_pattern'] . '\|\.svn-base$\|\.jax$')
call unite#custom#source('file_rec', 'ignore_pattern', unite#sources#rec#define()[0]['ignore_pattern'] . '\|\/lcov\/\|\.\d$')
"}}}

" memo {{{

" vim最新版インストール　http://yuheikagaya.hatenablog.jp/entry/2013/04/23/211530
" Mercurial(hg)コマンド を利用　最新にする際は hg pull; hg update;
" configureの失敗時は src/auto/config.logをみる soが無いと言われたのでシンボリックリンク作成→OK→コンパイルエラー Python.hがない　→　zypper in python-develで /usr/include/python2.6に　→　OK
" ./configure --enable-rubyinterp --enable-cscope --enable-gui --enable-gtk2-check --enable-gnome-check --with-x --enable-perlinterp --enable-pythoninterp --enable-python3interp --enable-xim --enable-rubyinterp --enable-multibyte --enable-pythoninterp=yes --with-python-config-dir=/usr/lib/python2.6/config
" gitでvimdiff svnも同じ感じ
" http://rubyonrails.gachinko.org/git/vimdiff/

" }}}

