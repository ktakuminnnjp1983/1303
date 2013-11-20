function! HighlightFunc()
    syntax match myFunc /[A-Za-z_]\w*\((\)\@=/
    syntax match myHashKey /[A-Za-z_]\w*\(:\)\@=/
    highlight myFunc ctermfg=133
    highlight myHashKey ctermfg=109
endfunc

autocmd BufNew,BufRead javascriptcall HighlightFunc()
call HighlightFunc()
