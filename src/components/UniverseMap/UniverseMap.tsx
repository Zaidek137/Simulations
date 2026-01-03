import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { Region, Location } from '@/data/universe-data';
import styles from './UniverseMap.module.css';

interface UniverseMapProps {
    onRegionSelect: (region: Region | null) => void;
    selectedRegion: Region | null;
    universeData: Region[];
    onCoordPick?: (coords: { x: number; y: number } | null) => void;
    baseBackground?: string;
    onLocationSelect?: (loc: Location, screenPos: { x: number; y: number }) => void;
    onLocationClose?: () => void;
    zoomResetRef?: React.MutableRefObject<(() => void) | null>;
}

/**
 * UniverseMap Component
 * 
 * COORDINATE SYSTEM:
 * - SVG viewBox: "0 0 2000 1600" (2000 wide x 1600 tall)
 * - Center point: (1000, 800)
 * - All universe/region coordinates (cx, cy) are absolute positions in this space
 * - All location coordinates (cx, cy) are absolute positions in this space
 * - When zooming/panning, the entire coordinate space transforms together
 * - This ensures locations stay fixed relative to the background image
 * 
 * PLACING LOCATIONS:
 * 1. Use Admin Portal coordinate picker
 * 2. Click on the map where you want the location
 * 3. The picked coordinates will align with the background image
 * 4. Locations will maintain their position during zoom/pan operations
 */
export default function UniverseMap({ onRegionSelect, selectedRegion, universeData, onCoordPick, baseBackground = '/images/multiversal-bg.png', onLocationSelect, onLocationClose, zoomResetRef }: UniverseMapProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null);
    const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

    // Initialize Zoom behavior
    useEffect(() => {
        if (!svgRef.current || !gRef.current) return;

        const svg = d3.select(svgRef.current);
        const g = d3.select(gRef.current);

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.5, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        zoomBehavior.current = zoom;
        svg.call(zoom);

        resetZoomState();
    }, []);

    const resetZoomState = () => {
        if (!svgRef.current || !zoomBehavior.current) return;
        const svg = d3.select(svgRef.current);
        
        // With viewBox="0 0 2000 1600", center the content at (1000, 800)
        // and show the map centered around coordinate (500, 400)
        const initialTransform = d3.zoomIdentity
            .translate(1000, 800)  // Center of the viewBox
            .scale(0.8)
            .translate(-500, -400);  // Offset to center around (500, 400) in coordinate space

        svg.transition()
            .duration(1200)
            .ease(d3.easeCubicInOut)
            .call(zoomBehavior.current.transform, initialTransform);
    };

    const zoomToUniverse = useCallback((region: Region) => {
        if (!svgRef.current || !zoomBehavior.current) return;

        const svg = d3.select(svgRef.current);
        // Lower scale = wider view, shows more of the universe
        const scale = 1.2;
        const transform = d3.zoomIdentity
            .translate(1000, 800)  // Center of viewBox (2000x1600)
            .scale(scale)
            .translate(-region.cx, -region.cy);

        svg.transition()
            .duration(1200)
            .ease(d3.easeCubicInOut)
            .call(zoomBehavior.current.transform, transform);
    }, []);

    // Expose zoom reset function for external use (e.g., closing location overlay)
    useEffect(() => {
        if (zoomResetRef && selectedRegion) {
            zoomResetRef.current = () => zoomToUniverse(selectedRegion);
        }
        return () => {
            if (zoomResetRef) {
                zoomResetRef.current = null;
            }
        };
    }, [zoomResetRef, selectedRegion, zoomToUniverse]);

    const handleRegionClick = (region: Region, event: React.MouseEvent) => {
        event.stopPropagation();
        onRegionSelect(region);
        zoomToUniverse(region);
    };

    const handleMapClick = (event: React.MouseEvent) => {
        if (!gRef.current) return;

        // If clicking background while in a region, check if we are picking coords
        if (onCoordPick) {
            const [x, y] = d3.pointer(event, gRef.current);
            onCoordPick({ x, y });
        }

        if (!selectedRegion) {
            onRegionSelect(null);
        }
    };

    const handleLocationClick = (loc: Location, event: React.MouseEvent) => {
        event.stopPropagation();

        if (!onLocationSelect || !svgRef.current || !zoomBehavior.current) return;

        // Get the screen position of the click for the expanding overlay origin
        const screenX = event.clientX;
        const screenY = event.clientY;

        // Zoom to the location
        const svg = d3.select(svgRef.current);
        const scale = 3.5;
        const transform = d3.zoomIdentity
            .translate(1000, 800)  // Center of viewBox (2000x1600)
            .scale(scale)
            .translate(-loc.cx, -loc.cy);

        svg.transition()
            .duration(800)
            .ease(d3.easeCubicInOut)
            .call(zoomBehavior.current.transform, transform);

        // Trigger the overlay after a slight delay for the zoom
        setTimeout(() => {
            onLocationSelect(loc, { x: screenX, y: screenY });
        }, 200);
    };

    const handleBack = (e: React.MouseEvent) => {
        e.stopPropagation();
        onLocationClose?.();
        onRegionSelect(null);
        resetZoomState();
    };

    return (
        <div className={styles.container}>
            {/* Back Button */}
            <AnimatePresence>
                {selectedRegion && (
                    <motion.button
                        className={styles.backButton}
                        onClick={handleBack}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Multiverse
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Background Transition Layer */}
            <AnimatePresence mode="wait">
                {(() => {
                    const bgUrl = selectedRegion ? selectedRegion.backgroundUrl : baseBackground;
                    const isVideo = bgUrl && (bgUrl.endsWith('.mp4') || bgUrl.endsWith('.webm') || bgUrl.endsWith('.mov'));

                    return isVideo ? (
                        <motion.video
                            key={selectedRegion ? selectedRegion.id : 'base'}
                            className={styles.backgroundVideo}
                            src={bgUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            initial={{ opacity: 0, scale: 1.15 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                        />
                    ) : (
                        <motion.div
                            key={selectedRegion ? selectedRegion.id : 'base'}
                            className={styles.backgroundLayer}
                            initial={{ opacity: 0, scale: 1.15 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                            style={{
                                backgroundImage: `url(${bgUrl})`
                            }}
                        />
                    );
                })()}
            </AnimatePresence>

            <div className={styles.backgroundDimmer} />

            <svg
                ref={svgRef}
                className={`${styles.svg} ${onCoordPick ? styles.pickingMode : ''}`}
                onClick={handleMapClick}
                viewBox="0 0 2000 1600"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    {onCoordPick && (
                        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        </pattern>
                    )}
                    {universeData.map(region => (
                        <radialGradient key={`grad-${region.id}`} id={`grad-${region.id}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={region.color} stopOpacity="0.5" />
                            <stop offset="100%" stopColor={region.color} stopOpacity="0" />
                        </radialGradient>
                    ))}
                </defs>
                <g ref={gRef}>
                    {onCoordPick && (
                        <rect width="2000" height="2000" x="-500" y="-500" fill="url(#grid)" pointerEvents="none" />
                    )}
                    {!selectedRegion && universeData.map((region) => (
                        <g key={region.id} className={styles.universeIcon}>
                            {/* Spiral Galaxy Effect - Nested for stable rotation */}
                            <g transform={`translate(${region.cx}, ${region.cy})`}>
                                <g className={styles.spiralArms} style={{ color: region.color }}>
                                    <circle r="150" fill={`url(#grad-${region.id})`} pointerEvents="none" />

                                    <path
                                        className={`${styles.spiralArm} ${styles.arm1}`}
                                        d="M 0 0 q -25 -70 45 -115 t 95 25 q 40 80 -20 120"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        className={`${styles.spiralArm} ${styles.arm2}`}
                                        d="M 0 0 q 70 -25 115 45 t -25 95 q -80 40 -120 -20"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        className={`${styles.spiralArm} ${styles.arm3}`}
                                        d="M 0 0 q 25 70 -45 115 t -95 -25 q -40 -80 20 -120"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />

                                    {/* Star Particles - Enhanced */}
                                    <g className={styles.stars}>
                                        <circle className={styles.star} cx="30" cy="-40" r="2.5" fill="white" />
                                        <circle className={styles.star} cx="-50" cy="20" r="2" fill="white" />
                                        <circle className={styles.star} cx="60" cy="50" r="3" fill="white" />
                                        <circle className={styles.star} cx="-20" cy="-70" r="2.2" fill="white" />
                                        <circle className={styles.star} cx="80" cy="-10" r="2.5" fill="white" />
                                        <circle className={styles.star} cx="-40" cy="80" r="2" fill="white" />
                                        <circle className={styles.star} cx="45" cy="35" r="1.8" fill="white" />
                                        <circle className={styles.star} cx="-60" cy="-30" r="2.2" fill="white" />
                                        <circle className={styles.star} cx="10" cy="65" r="1.5" fill="white" />
                                        <circle className={styles.star} cx="-70" cy="50" r="1.8" fill="white" />
                                    </g>
                                </g>

                                {/* Glow Circle - Shared position */}
                                <circle
                                    r="80"
                                    fill={region.color}
                                    opacity="0.15"
                                    className={styles.glowCircle}
                                    style={{ stroke: region.color, strokeWidth: 1.5 }}
                                />
                            </g>

                            <foreignObject
                                x={region.cx - 70}
                                y={region.cy - 70}
                                width="140"
                                height="140"
                                onClick={(e) => handleRegionClick(region, e)}
                            >
                                <div className={styles.iconWrapper}>
                                    <div className={styles.iconContainer} style={{
                                        width: '100px',
                                        height: '100px',
                                        border: `3px solid ${region.color}`,
                                        boxShadow: `0 0 35px ${region.color}99`,
                                    }}>
                                        <img
                                            src={region.thumbUrl}
                                            alt={region.name}
                                            className={styles.iconImage}
                                        />
                                    </div>
                                </div>
                            </foreignObject>

                            <text
                                x={region.cx}
                                y={region.cy + 75}
                                className={styles.regionText}
                            >
                                {region.name}
                            </text>
                        </g>
                    ))}

                    {selectedRegion && selectedRegion.locations.map((loc) => (
                        <g key={loc.id} className={styles.locationMarker} style={{ color: selectedRegion.color }}>
                            <circle cx={loc.cx} cy={loc.cy} r="60" fill={selectedRegion.color} opacity="0.1" className={styles.sonarRing} />

                            <foreignObject
                                x={loc.cx - 55}
                                y={loc.cy - 55}
                                width="110"
                                height="110"
                                onClick={(e) => handleLocationClick(loc, e)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className={styles.iconWrapper}>
                                    <div className={styles.iconContainer} style={{
                                        width: '80px',
                                        height: '80px',
                                        border: `2px solid ${selectedRegion.color}`,
                                        boxShadow: `0 0 25px ${selectedRegion.color}99`,
                                    }}>
                                        <img
                                            src={loc.thumbUrl}
                                            alt={loc.name}
                                            className={styles.iconImage}
                                        />
                                    </div>
                                </div>
                            </foreignObject>

                            <text
                                x={loc.cx}
                                y={loc.cy + 60}
                                className={styles.locationText}
                            >
                                {loc.name}
                            </text>
                        </g>
                    ))}
                </g>
            </svg>
        </div>
    );
}
