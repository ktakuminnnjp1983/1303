function! HighlightFunc()
    syntax match myFunc /[A-Za-z_]\w*\((\)\@=/
    syntax match myFunc2 /\W\w*\(<.*>(\)\@=/
    syntax match myComp /\W[A-Z][a-z_A-Z]*\(\W\)\@=/
    syntax match myClass /\WC[A-Za-z]\w*\(\W\)\@=/
    syntax match myClass2 /^C[A-Za-z]\w*\(\W\)\@=/
    syntax match myEnum /\WE[A-Z]\w*\(\W\)\@=/
    syntax match myfinstance /\Wf[A-Z]\w*\(\W\)\@=/
    syntax match myfginstance /\Wfg[A-Z]\w*\(\W\)\@=/
    syntax match myConst /\W[A-Z_][A-Z_0-9]\+\(\W\)\@=/
    syntax match myConst2 /\W[A-Z_][A-Z_0-9]\+$/
    
    syntax keyword myVector vector
    syntax keyword myString string
    syntax keyword myStringStream stringstream
    
    " syntax match kkk /)/
    
    highlight myFunc ctermfg=133
    highlight myFunc2 ctermfg=133
    highlight myComp ctermfg=71
    highlight myClass ctermfg=71
    highlight myClass2 ctermfg=71
    highlight myEnum ctermfg=68
    highlight myfginstance ctermfg=151
    highlight myfinstance ctermfg=137
    highlight myConst ctermfg=166
    highlight myConst2 ctermfg=166
   
    highlight myvector ctermfg=173
    highlight myString ctermfg=173
    highlight myStringStream ctermfg=173
    
    " highlight kkk ctermfg=255
endfunc

autocmd BufNew,BufRead cpp call HighlightFunc()
call HighlightFunc()
