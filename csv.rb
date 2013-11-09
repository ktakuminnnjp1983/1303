#!/usr/bin/ruby

require "csv"

if ARGV.size != 2
    puts "input originalCSV generateCSV"
    exit 1
end

reader = CSV.open(ARGV[0], "r")

header = reader.take(1)[0]
rows = []

reader.each do |row|
    rows << row 
end
reader.close

puts "===== header ======"
p header
puts "===== header ======"
puts "===== rows ======"
rows.each do |row|
    p row
end
puts "===== rows ======"

targetColumns = []
newHeader = []
header.each_with_index do |el, index|
    if el
        targetColumns << index
        newHeader << el
    end
end

puts "===== targetColumns ======"
p targetColumns
puts "===== targetColumns ======"

newRows = []
rows.each do |row|
    next if row[0] == nil
    newRow = []
    targetColumns.each do |index|
        newRow << row[index]
    end
    newRows << newRow
end

puts "====== newHeader ======"
p newHeader
puts "====== newHeader ======"
puts "===== newRows ======"
newRows.each do |row|
    p row
end
puts "===== newRows ======"

CSV.open(ARGV[1], "w") do |writer|
    writer << newHeader
    newRows.each do |row|
        writer << row
    end
end

puts "generated #{ARGV[1]}"

