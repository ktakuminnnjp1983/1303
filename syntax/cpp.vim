function! HighlightFunc()
    syntax match myFunc /[A-Za-z_]\w*\((\)\@=/
    syntax match myFunc2 /\W\w*\(<.*>(\)\@=/
    syntax match myClass /[ (<:]C[A-Za-z]\w*\(\W\)\@=/
    syntax match myClass2 /^C[A-Za-z]\w*\(\W\)\@=/
    syntax match myEnum /[ (<:]E[A-Z]\w*\(\W\)\@=/
    syntax match myfinstance /[ (:.]f[A-Z]\w*\(\W\)\@=/
    syntax match myfginstance /[ (:.]fg[A-Z]\w*\(\W\)\@=/
    syntax keyword myString string
    syntax match kkk /)/
    highlight myFunc ctermfg=174
    highlight myFunc2 ctermfg=174
    highlight myClass ctermfg=71
    highlight myClass2 ctermfg=71
    highlight myEnum ctermfg=68
    highlight myString ctermfg=173
    highlight myKakko ctermfg=15
    highlight myfinstance ctermfg=137
    highlight myfginstance ctermfg=151
    highlight kkk ctermfg=255
endfunc

autocmd BufNew,BufRead cpp call HighlightFunc()
call HighlightFunc()
