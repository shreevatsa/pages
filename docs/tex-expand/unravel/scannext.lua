print("\n\nHello world")

local inspect = require('inspect')

function dump(o)
   if type(o) == 'table' then
      local s = '{ '
      for k,v in pairs(o) do
         if type(k) ~= 'number' then k = '"'..k..'"' end
         s = s .. '['..k..'] = ' .. dump(v) .. ','
      end
      return s .. '} '
   else
      return tostring(o)
   end
end

function printObj(obj, hierarchyLevel)
   if (hierarchyLevel == nil) then
      hierarchyLevel = 0
   elseif (hierarchyLevel == 4) then
      return 0
   end

   local whitespace = ""
   for i=0,hierarchyLevel,1 do
      whitespace = whitespace .. "-"
   end
   io.write(whitespace)

   print(obj)
   if (type(obj) == "table") then
      for k,v in pairs(obj) do
         io.write(whitespace .. "-")
         if (type(v) == "table") then
            printObj(v, hierarchyLevel+1)
         else
            print(v)
         end
      end
   else
      print(obj)
   end
end


local t = newtoken.get_next()
print(t)
print(dump(t))
print(inspect(t))
print('Command', t.command)
print('Cmdname', t.cmdname)
print('Csname', t.csname)
print('ID', t.id)
print('Active', t.active)
print('Expandable', t.expandable)
print('Protected', t.protected)
print('getmetatable', inspect(getmetatable(t)))
print('tostring', tostring(t))

-- local t = newtoken.scan_toks()
-- print ()
-- print ('scantoks', t)
-- print ('inspect', inspect(t))
-- print ('dump', dump(t))

print("\n\n")
