#!/usr/bin/ruby

require "csv"
require "optparse"

Version = "0.0.1"
banner = "Usage: csv.rb [options] inputFile(csv or excel) outputFile(csv)"

sheet = nil
showMode = false
OptionParser.new(banner) do |opt|
    opt.on("-e number", "excel sheet number") do |v|
        sheet = v.to_i
    end
    opt.on("-d", "show detail") do |v|
        showMode = true
    end
    opt.parse!(ARGV)
end

if ARGV.size != 2
    puts "invalid args. see -h"
    exit 1
end

targetFileName = ARGV[0]
if sheet
    require "roo"
    name, suffix = targetFileName.split(".")
    if suffix != "xls" && suffix != "xlsx" 
        puts "input .xls or .xlsx"
        exit 1
    end
    book = Roo::Spreadsheet.open(targetFileName)
    book.default_sheet = book.sheets[sheet]
    targetFileName = name + ".csv"
    book.to_csv(targetFileName)
    puts "generated #{targetFileName}"
else
    if targetFileName !~ /\.csv$/
        puts "input csv file"
        exit 1
    end
end

reader = CSV.open(targetFileName, "r")

header = reader.take(1)[0]
rows = []

reader.each do |row|
    rows << row 
end
reader.close

if showMode
    puts "===== header ======"
    p header
    puts "===== header ======"
    puts "===== rows ======"
    rows.each do |row|
        p row
    end
    puts "===== rows ======"
end

targetColumns = []
newHeader = []
header.each_with_index do |el, index|
    if el
        targetColumns << index
        newHeader << el
    end
end

if showMode
    puts "===== targetColumns ======"
    p targetColumns
    puts "===== targetColumns ======"
end

newRows = []
rows.each do |row|
    next if row[0] == nil
    newRow = []
    targetColumns.each do |index|
        newRow << row[index]
    end
    newRows << newRow
end

if showMode
    puts "====== newHeader ======"
    p newHeader
    puts "====== newHeader ======"
    puts "===== newRows ======"
    newRows.each do |row|
        p row
    end
    puts "===== newRows ======"
end

CSV.open(ARGV[1], "w") do |writer|
    writer << newHeader
    newRows.each do |row|
        writer << row
    end
end

puts "generated #{ARGV[1]}"
exit 0

