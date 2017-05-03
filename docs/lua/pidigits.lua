function str(arr)
    ret = ""
    for key, value in pairs(arr) do
            ret = ret.." "..value
    end
    return ret
end

-- Spigot algorithm by Rabinowitz and Wagon:
-- http://www.cecm.sfu.ca/~jborwein/Expbook/Manuscript/Related%20files/spigot.pdf

--[[
The idea of the algorithm: we can say that
pi = 3 + (1, 4, 1, 5, 9, ...) in base (1/10, 1/10, 1/10, 1/10, 1/10, ...)
Similarly, from a well-known formula,
pi = 2 + (2, 2, 2, 2, 2, 2, ...) in base (1/3, 2/5, 3/7, 4/9, 5/11, 6/13,...)
(Let us call this base C.)
So to get the digits of pi, we just have to convert to the familiar base.
--]]

n = 1000                        -- The number of digits we want.
len = math.floor(10 * n / 3)    -- Just setting a value high enough.
a = {}                          -- Denotes the number (2, 2, 2, 2, ) in base C.

-- Write down pi in base C: it is (2, 2, 2, 2, 2, ....)
for j = 1, len do
    a[j] = 2
end
nines = 0
predigit = 0
-- Start extracting digits
for j = 1, n do
    -- Multiply by 10
    carry = 0
    for i = len, 1, -1 do
        x = 10 * a[i] + carry * i
        a[i] = math.fmod(x, 2 * i - 1)
        carry = math.modf(x / (2 * i - 1))
    end
    a[1] = math.fmod(carry, 10)
    carry = math.modf(carry / 10)
    -- Note that 0 <= carry <= 10. (Why?)
    if carry < 9 then
        -- Write out earlier digit(s)
        io.write(predigit)
        for k = 1, nines do
            io.write(9)
        end
        nines = 0
        predigit = carry
    else
        if carry == 9 then
            -- Too early to know if we need a carry
            nines = nines + 1
        else
            -- If we got here, it means carry = 10
            io.write(predigit + 1)
            for k = 1, nines do
                io.write(0)
            end
            nines = 0
            predigit = 0
        end
    end
end
-- The remaining digit, let's not throw it away.
io.write(predigit)
io.write('\n')
