function str(arr)
    local ret = ""
    for key, value in pairs(arr) do
            ret = ret.." "..value
    end
    return ret
end

function pi_digits_with_leading_zero()
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
    local n = 1000 -- The number of digits we want.
    local len = math.floor(10 * n / 3) + 1 -- Setting a value high enough.
    local a = {} -- Denotes the number (2, 2, 2, 2, ) in base C.

    -- Write down pi in base C: it is (2, 2, 2, 2, 2, ....)
    for j = 1, len do
        a[j] = 2
    end
    local nines = 0
    local predigit = 0
    -- Start extracting digits
    for j = 1, n do
        -- Multiply by 10
        local carry = 0
        for i = len, 1, -1 do
            local x = 10 * a[i] + carry * i
            a[i] = math.fmod(x, 2 * i - 1)
            carry = math.modf(x / (2 * i - 1))
        end
        a[1] = math.fmod(carry, 10)
        carry = math.modf(carry / 10)
        -- Note that 0 <= carry <= 10. (Why?)
        if carry < 9 then
            -- Write out earlier digit(s)
            coroutine.yield(predigit)
            for k = 1, nines do
                coroutine.yield(9)
            end
            nines = 0
            predigit = carry
        elseif carry == 9 then
            -- Too early to know if we need a carry
            nines = nines + 1
        else
            -- If we got here, it means carry = 10
            coroutine.yield(predigit + 1)
            for k = 1, nines do
                coroutine.yield(0)
            end
            nines = 0
            predigit = 0
        end
    end
    -- The remaining digit, let's not throw it away.
    coroutine.yield(predigit)
end

-- function pi_digits(put)
--     -- Calls `put` on each digit of pi.
--     local done = 0
--     for digit in coroutine.wrap(pi_digits_with_leading_zero) do
--         if done > 0 then
--             put(digit)
--         end
--         done = done + 1
--     end
-- end

function p(digit)
    print('This is a digit '..digit)
    -- print(digit)
end

function edges()
    local i = -1 -- The position of the digit being printed
    local previous = nil
    for digit in coroutine.wrap(pi_digits_with_leading_zero) do
        if i >= 1 then
            coroutine.yield({previous, i - 1, digit, i})
        end
        previous = digit
        i = i + 1
    end
end

function print_edges()
    for edge in coroutine.wrap(edges) do
        local d1 = edge[1]
        local p1 = edge[2]
        local d2 = edge[3]
        local p2 = edge[4]
        tex.print("\\path ("..d1.."-"..p1..") edge [bend right, color=c"..d1.."] ("..d2.."-"..p2..");")
    end
end

print_edges()
