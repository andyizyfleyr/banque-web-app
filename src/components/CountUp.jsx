"use client";
import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export const CountUp = ({ value, prefix = "", suffix = "", decimals = 0, className = "" }) => {
    const ref = useRef(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 50,
        stiffness: 100,
    });
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    // Ensure we show something even if animation doesn't trigger (e.g. value is 0)
    useEffect(() => {
        if (ref.current) {
            ref.current.textContent = `${prefix}${value.toLocaleString("fr-FR", {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            })}${suffix}`;
        }
    }, [value, prefix, suffix, decimals]);

    useEffect(() => {
        const unsubscribe = springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = `${prefix}${latest.toLocaleString("fr-FR", {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals,
                })}${suffix}`;
            }
        });
        return () => unsubscribe();
    }, [springValue, decimals, prefix, suffix]);

    return <span ref={ref} className={className}>{prefix}{value.toLocaleString("fr-FR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })}{suffix}</span>;
};
