"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface NumberTickerProps {
    value: number | bigint | string;
    className?: string;
    prefix?: string;
    suffix?: string;
    decimalPlaces?: number;
    delay?: number;
    direction?: "up" | "down";
    format?: Omit<Intl.NumberFormatOptions, "notation"> & {
        notation?: "standard" | "compact";
    };
}

export function NumberTicker({
    value,
    className,
    prefix = "",
    suffix = "",
    decimalPlaces = 0,
    delay = 0,
    direction = "up",
    format
}: NumberTickerProps) {
    const numValue = typeof value === 'number' ? value : Number(value) || 0;
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(direction === "down" ? numValue : 0);
    const springValue = useSpring(motionValue, {
        damping: 40,
        stiffness: 120,
    });
    const isInView = useInView(ref, { once: true, margin: "0px" });

    const formatNumber = (val: number) => {
        const options: Intl.NumberFormatOptions = {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
            ...(format || {})
        };
        return Intl.NumberFormat("en-IN", options).format(val);
    };

    useEffect(() => {
        if (!isInView) return;
        const timer = setTimeout(() => {
            motionValue.set(direction === "down" ? 0 : numValue);
        }, delay * 1000);
        return () => clearTimeout(timer);
    }, [motionValue, isInView, delay, numValue, direction]);

    useEffect(() => {
        const unsubscribe = springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = `${prefix}${formatNumber(latest)}${suffix}`;
            }
        });
        return () => unsubscribe();
    }, [springValue, decimalPlaces, prefix, suffix, format]);

    return (
        <span className={className} ref={ref}>
            {prefix}{formatNumber(numValue)}{suffix}
        </span>
    );
}
