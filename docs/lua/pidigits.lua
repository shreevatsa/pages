function pi_digits()
    -- Spigot algorithm by Rabinowitz and Wagon:
    -- http://www.cecm.sfu.ca/~jborwein/Expbook/Manuscript/Related%20files/spigot.pdf
    -- The idea of the algorithm: we can say that
    -- pi = 3 + (1, 4, 1, 5, 9, ...) in base (1/10, 1/10, 1/10, 1/10, 1/10, ...)
    -- Similarly, from a well-known formula,
    -- pi = 2 + (2, 2, 2, 2, 2, 2, ...) in base (1/3, 2/5, 3/7, 4/9, 5/11, 6/13,...)
    -- So to get the digits of pi, we just have to convert to the familiar base.

    local n = 1000  -- The number of digits we want.
    local len = math.floor(10 * n / 3) + 1  -- A value high enough (see Gibbons)
    local a = {}  -- Holds the number pi in base C. (Later: pi * 10^k after k steps.)
    for j = 1, len do
        a[j] = 2
    end
    local nines = 0
    local predigit = 0
    for k = 1, n do
        local carry = 0  -- We're about to multiply by 10
        for i = len, 1, -1 do
            local x = 10 * a[i] + carry * i
            a[i] = math.fmod(x, 2 * i - 1)
            carry = math.modf(x / (2 * i - 1))
        end
        a[1] = math.fmod(carry, 10)
        carry = math.modf(carry / 10)
        if carry < 9 then
            coroutine.yield(predigit)
            for k = 1, nines do
                coroutine.yield(9)
            end
            nines = 0
            predigit = carry
        elseif carry == 9 then
            nines = nines + 1  -- Too early to know what digits to print.
        else  -- If we got here, it means carry = 10
            coroutine.yield(predigit + 1)
            for k = 1, nines do
                coroutine.yield(0)
            end
            nines = 0
            predigit = 0
        end
    end
    coroutine.yield(predigit)  -- The remaining digit, let's not throw it away.
end
