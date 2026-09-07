"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    GitBranch, 
    Play, 
    Pause, 
    Clock, 
    UserCheck,
    CheckCircle2,
    Sparkles,
    MoveRight,
    Smartphone
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CanvasNode {
    id: string;
    stage: string;
    stageNum: string;
    title: string;
    lines: string[];
    x: number;
    y: number;
    w: number;
    h: number;
    shape: 'box' | 'diamond';
    type: 'process' | 'decision' | 'revision' | 'accept' | 'reject';
    timeline: string;
    actor: string;
    desc: string;
    details: string[];
}

interface PathData {
    points: Array<{ x: number; y: number }>;
    lengths: number[];
    cumulative: number[];
    totalLength: number;
}

interface ParticleStream {
    pathIndex: number;
    distance: number;
    speed: number;
    color: string;
    glowColor: string;
    radius: number;
}

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 440;

// Standard 4-Stage Academic Peer Review Workflow (COPE & ICMJE Compliant)
const NODES: CanvasNode[] = [
    // ================= STAGE 1: SUBMISSION & SCREENING =================
    {
        id: 'author_submit',
        stage: 'Submission Stage',
        stageNum: '01',
        title: 'Author Submits Manuscript',
        lines: ['Author Submits', 'Manuscript (.docx)'],
        x: 35,
        y: 65,
        w: 180,
        h: 56,
        shape: 'box',
        type: 'process',
        timeline: 'Day 0',
        actor: 'Corresponding Author',
        desc: 'Author submits original manuscript, cover letter, author declarations, and research metadata through the online submission portal.',
        details: [
            'Plagiarism pre-check via CrossRef Similarity Check',
            'Verification of author affiliations and conflict disclosures',
            'Confirmation of compliance with IJITEST author guidelines'
        ]
    },
    {
        id: 'screen_decision',
        stage: 'Submission Stage',
        stageNum: '01',
        title: 'Initial Scope & Quality Check',
        lines: ['Scope & Quality', 'Screening?'],
        x: 125,
        y: 195,
        w: 130,
        h: 80,
        shape: 'diamond',
        type: 'decision',
        timeline: '1–3 Days',
        actor: 'Editor-in-Chief',
        desc: 'Editorial screening checks manuscript fit with journal scope, baseline technical clarity, and academic integrity prior to external peer review.',
        details: [
            'Relevance to emerging engineering and technological sciences',
            'Similarity index threshold strictly verified (<15%)',
            'Formatting and reference structure compliance'
        ]
    },
    {
        id: 'desk_reject',
        stage: 'Submission Stage',
        stageNum: '01',
        title: 'Desk Rejection & Notice',
        lines: ['Desk Rejection', '& Feedback Letter'],
        x: 35,
        y: 320,
        w: 180,
        h: 56,
        shape: 'box',
        type: 'reject',
        timeline: 'Within 3 Days',
        actor: 'Editorial Office',
        desc: 'Manuscripts out of scope or failing baseline technical rigor are promptly rejected with constructive feedback, saving authors time.',
        details: [
            'Clear rationale provided in editorial rejection letter',
            'Suggestions for alternative venues or fundamental restructuring',
            'Zero submission or processing fees incurred'
        ]
    },

    // ================= STAGE 2: PEER REVIEW =================
    {
        id: 'assign_reviewers',
        stage: 'Review Stage',
        stageNum: '02',
        title: 'Editor Assigns Reviewers',
        lines: ['Editor Assigns', 'Peer Reviewers'],
        x: 275,
        y: 167,
        w: 195,
        h: 56,
        shape: 'box',
        type: 'process',
        timeline: '3–5 Days',
        actor: 'Handling Editor',
        desc: 'Manuscript is anonymized for double-blind peer review and matched to at least two external subject matter experts.',
        details: [
            'Double-blind anonymization to prevent bias',
            'Strict COPE conflict-of-interest screening',
            'Direct referee invitations and timeline commitment'
        ]
    },
    {
        id: 'reviewers_evaluate',
        stage: 'Review Stage',
        stageNum: '02',
        title: 'Referees Evaluate & Recommend',
        lines: ['Reviewers Evaluate', '& Submit Reports'],
        x: 275,
        y: 65,
        w: 195,
        h: 56,
        shape: 'box',
        type: 'process',
        timeline: '2–4 Weeks',
        actor: '2+ Independent Reviewers',
        desc: 'Referees systematically evaluate scientific novelty, theoretical rigor, experimental validity, and conclusion justifications.',
        details: [
            'Methodological soundness and mathematical validation',
            'Reproducibility of experimental or computational results',
            'Detailed report with structured recommendation to Editor'
        ]
    },

    // ================= STAGE 3: EDITORIAL DECISION =================
    {
        id: 'formal_reject',
        stage: 'Decision Stage',
        stageNum: '03',
        title: 'Formal Post-Review Rejection',
        lines: ['Article Rejected', '& Feedback Sent'],
        x: 525,
        y: 22,
        w: 170,
        h: 50,
        shape: 'box',
        type: 'reject',
        timeline: 'Within 1 Week',
        actor: 'Editor-in-Chief',
        desc: 'Critical scientific flaws, unverified claims, or fatal methodological shortcomings identified by reviewers result in formal rejection.',
        details: [
            'Full referee reports and critique provided to authors',
            'Appeals allowed within 14 days under COPE grievance protocols',
            'Editorial decision is final and archived'
        ]
    },
    {
        id: 'editorial_decision',
        stage: 'Decision Stage',
        stageNum: '03',
        title: 'Editorial Decision Hub',
        lines: ['Editorial', 'Decision?'],
        x: 610,
        y: 155,
        w: 140,
        h: 90,
        shape: 'diamond',
        type: 'decision',
        timeline: '3–7 Days',
        actor: 'Editor-in-Chief',
        desc: 'Handling editor consolidates all referee evaluations and delivers an authoritative verdict balancing all technical remarks.',
        details: [
            'Synthesis of multiple reviewer recommendations',
            'Categorization into Accept, Minor Revisions, Major Revisions, or Reject',
            'Actionable instructions and decision letter transmitted to author'
        ]
    },
    {
        id: 'minor_revision',
        stage: 'Decision Stage',
        stageNum: '03',
        title: 'Minor Revision Cycle',
        lines: ['Minor Revisions', '(Author Updates)'],
        x: 520,
        y: 245,
        w: 165,
        h: 52,
        shape: 'box',
        type: 'revision',
        timeline: '1–2 Weeks',
        actor: 'Author & Editor',
        desc: 'Author carries out minor textual modifications, citation updates, figure clarifications, or formatting adjustments.',
        details: [
            'Authors upload tracked changes and point-by-point response',
            'Does not require new experiments or structural rewriting',
            'Fast-tracked directly to Handling Editor verification'
        ]
    },
    {
        id: 'editor_verifies',
        stage: 'Decision Stage',
        stageNum: '03',
        title: 'Editor Verifies Revisions',
        lines: ['Editor Verifies', '(Fast-Track)'],
        x: 700,
        y: 245,
        w: 110,
        h: 52,
        shape: 'box',
        type: 'revision',
        timeline: '2–3 Days',
        actor: 'Handling Editor',
        desc: 'Editor directly validates that all minor remarks were satisfied, bypassing the need for a full re-review cycle.',
        details: [
            'Expedited evaluation to accelerate publication timeline',
            'Confirmation of compliance with referee notes',
            'Direct endorsement for Final Acceptance'
        ]
    },
    {
        id: 'major_revision',
        stage: 'Decision Stage',
        stageNum: '03',
        title: 'Major Revision & Re-Review Loop',
        lines: ['Major Revisions', '(Author Resubmits)'],
        x: 520,
        y: 340,
        w: 165,
        h: 52,
        shape: 'box',
        type: 'revision',
        timeline: '3–4 Weeks',
        actor: 'Author & Referees',
        desc: 'Substantial experimental extensions, deeper mathematical proof, or significant theoretical refactoring required.',
        details: [
            'Extensive revisions with comprehensive point-by-point rebuttal',
            'Sent back to original peer reviewers for secondary evaluation',
            'Ensures scientific claims are thoroughly validated before publication'
        ]
    },

    // ================= STAGE 4: PUBLICATION & DOI =================
    {
        id: 'final_acceptance',
        stage: 'Publication Stage',
        stageNum: '04',
        title: 'Final Acceptance & Typesetting',
        lines: ['Final Acceptance &', 'Galley Typesetting'],
        x: 840,
        y: 65,
        w: 205,
        h: 56,
        shape: 'box',
        type: 'accept',
        timeline: '3–5 Days',
        actor: 'Production Team',
        desc: 'Official acceptance certificate issued. Article undergoes copyediting, XML typesetting, and authors approve final galley proofs.',
        details: [
            'Typesetting according to IJITEST LaTeX/Word template standards',
            'Author proofreading round within 48 hours',
            'Final bibliographic and figure resolution checks'
        ]
    },
    {
        id: 'crossref_doi',
        stage: 'Publication Stage',
        stageNum: '04',
        title: 'CrossRef DOI & Metadata Deposit',
        lines: ['CrossRef DOI Registry', '& Metadata Deposit'],
        x: 840,
        y: 185,
        w: 205,
        h: 58,
        shape: 'box',
        type: 'accept',
        timeline: '24–48 Hours',
        actor: 'CrossRef Plugin & Publisher',
        desc: 'Unique Digital Object Identifier (DOI) registered with CrossRef. Metadata and references permanently deposited for citation indexing.',
        details: [
            'Automated CrossRef metadata deposit via journal plugin',
            'Permanent doi.org resolution URL generated',
            'Crossmark compliance and cited-by link tracking enabled'
        ]
    },
    {
        id: 'published_online',
        stage: 'Publication Stage',
        stageNum: '04',
        title: 'Published Online & Global Indexing',
        lines: ['Published Online in Issue', '& Global Indexing'],
        x: 840,
        y: 310,
        w: 205,
        h: 56,
        shape: 'box',
        type: 'accept',
        timeline: 'Immediate',
        actor: 'Global Academic Community',
        desc: 'Open-access paper is published in the current volume and distributed to global databases including Google Scholar, DOAJ, and repositories.',
        details: [
            'Immediate Gold Open Access distribution',
            'Automated indexing in Google Scholar, ResearchGate, Zenodo, DOAJ',
            'Permanent digital archiving with volume and issue pagination'
        ]
    }
];

// Raw path waypoints matching connector paths exactly
const RAW_PATHS: Array<Array<{ x: number; y: number }>> = [
    // Path 0: Direct Publication Journey (Green / Emerald)
    [
        { x: 125, y: 93 },
        { x: 125, y: 155 },
        { x: 125, y: 195 },
        { x: 190, y: 195 },
        { x: 275, y: 195 },
        { x: 372, y: 195 },
        { x: 372, y: 167 },
        { x: 372, y: 121 },
        { x: 372, y: 93 },
        { x: 470, y: 93 },
        { x: 540, y: 93 },
        { x: 540, y: 155 },
        { x: 610, y: 155 },
        { x: 680, y: 155 },
        { x: 820, y: 155 },
        { x: 820, y: 93 },
        { x: 840, y: 93 },
        { x: 942, y: 93 },
        { x: 942, y: 121 },
        { x: 942, y: 185 },
        { x: 942, y: 214 },
        { x: 942, y: 243 },
        { x: 942, y: 310 },
        { x: 942, y: 338 }
    ],
    // Path 1: Minor Revision Fast-Track (Amber)
    [
        { x: 610, y: 155 },
        { x: 580, y: 185 },
        { x: 580, y: 245 },
        { x: 580, y: 271 },
        { x: 685, y: 271 },
        { x: 700, y: 271 },
        { x: 755, y: 271 },
        { x: 755, y: 245 },
        { x: 755, y: 93 },
        { x: 840, y: 93 },
        { x: 942, y: 93 },
        { x: 942, y: 185 },
        { x: 942, y: 310 }
    ],
    // Path 2: Major Revision Re-Review Loop (Orange)
    [
        { x: 610, y: 155 },
        { x: 610, y: 200 },
        { x: 610, y: 340 },
        { x: 610, y: 366 },
        { x: 520, y: 366 },
        { x: 372, y: 366 },
        { x: 372, y: 223 },
        { x: 372, y: 167 },
        { x: 372, y: 121 },
        { x: 372, y: 93 },
        { x: 470, y: 93 },
        { x: 540, y: 93 },
        { x: 540, y: 155 },
        { x: 610, y: 155 }
    ],
    // Path 3: Desk Rejection (Rose)
    [
        { x: 125, y: 93 },
        { x: 125, y: 155 },
        { x: 125, y: 235 },
        { x: 125, y: 320 },
        { x: 125, y: 348 }
    ],
    // Path 4: Post-Review Formal Rejection (Crimson)
    [
        { x: 372, y: 93 },
        { x: 470, y: 93 },
        { x: 540, y: 93 },
        { x: 540, y: 155 },
        { x: 610, y: 155 },
        { x: 610, y: 110 },
        { x: 610, y: 72 },
        { x: 610, y: 47 }
    ]
];

// Precompute cumulative lengths for 100% mathematically exact path following
function computePathData(points: Array<{ x: number; y: number }>): PathData {
    const lengths: number[] = [];
    const cumulative: number[] = [0];
    let total = 0;

    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        if (!p1 || !p2) continue;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        lengths.push(len);
        total += len;
        cumulative.push(total);
    }

    return {
        points,
        lengths,
        cumulative,
        totalLength: Math.max(total, 1)
    };
}

// Exact point calculation at any continuous distance along a polyline
function getPointAtDistance(pathData: PathData, dist: number): { x: number; y: number } {
    const { points, lengths, cumulative, totalLength } = pathData;
    const d = ((dist % totalLength) + totalLength) % totalLength;

    for (let i = 0; i < lengths.length; i++) {
        const segLen = lengths[i] ?? 0;
        const cumStart = cumulative[i] ?? 0;
        const cumEnd = cumulative[i + 1] ?? 0;

        if (d >= cumStart && d <= cumEnd && segLen > 0) {
            const t = (d - cumStart) / segLen;
            const p1 = points[i];
            const p2 = points[i + 1];
            if (!p1 || !p2) break;
            return {
                x: p1.x + t * (p2.x - p1.x),
                y: p1.y + t * (p2.y - p1.y)
            };
        }
    }

    const first = points[0];
    return first ? { x: first.x, y: first.y } : { x: 0, y: 0 };
}

export default function PeerReviewFlowchart() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string>('crossref_doi');
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [activeStageTab, setActiveStageTab] = useState<string>('04');
    const isPlayingRef = useRef<boolean>(true);
    isPlayingRef.current = isPlaying;

    const fallbackNode = NODES[10]!;
    const activeNode: CanvasNode = NODES.find((n) => n.id === (hoveredNodeId || selectedNodeId)) ?? fallbackNode;

    // Precompute path geometry
    const compiledPaths = useMemo(() => {
        return RAW_PATHS.map((pts) => computePathData(pts));
    }, []);

    // Scroll to specific stage column on mobile
    const scrollToStage = (stageNum: string) => {
        setActiveStageTab(stageNum);
        if (!containerRef.current) return;
        const targetOffsets: Record<string, number> = {
            '01': 0,
            '02': 230,
            '03': 490,
            '04': 800
        };
        const offset = targetOffsets[stageNum] ?? 0;
        containerRef.current.scrollTo({
            left: offset,
            behavior: 'smooth'
        });

        // Also select primary node for that stage
        const primaryNodes: Record<string, string> = {
            '01': 'screen_decision',
            '02': 'reviewers_evaluate',
            '03': 'editorial_decision',
            '04': 'crossref_doi'
        };
        const nodeId = primaryNodes[stageNum];
        if (nodeId) {
            setSelectedNodeId(nodeId);
        }
    };

    // Canvas animation loop with mathematical precision
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let lastTime = performance.now();

        // Continuous streaming particles with comets
        const streams: ParticleStream[] = [
            { pathIndex: 0, distance: 0, speed: 110, color: '#10b981', glowColor: 'rgba(16,185,129,0.85)', radius: 4 },
            { pathIndex: 0, distance: 680, speed: 110, color: '#06b6d4', glowColor: 'rgba(6,182,212,0.85)', radius: 4 },
            { pathIndex: 1, distance: 80, speed: 95, color: '#f59e0b', glowColor: 'rgba(245,158,11,0.85)', radius: 3.5 },
            { pathIndex: 2, distance: 220, speed: 100, color: '#f97316', glowColor: 'rgba(249,115,22,0.85)', radius: 3.5 },
            { pathIndex: 3, distance: 40, speed: 85, color: '#f43f5e', glowColor: 'rgba(244,63,94,0.85)', radius: 3.5 },
            { pathIndex: 4, distance: 90, speed: 90, color: '#e11d48', glowColor: 'rgba(225,29,72,0.85)', radius: 3.5 }
        ];

        // Draw crisp rounded rectangle with multi-layer shadow and glow
        const drawRoundedBox = (
            x: number,
            y: number,
            w: number,
            h: number,
            r: number,
            fill: string,
            stroke: string,
            lineWidth: number,
            isHovered: boolean,
            isSelected: boolean,
            glowRgb: string
        ) => {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();

            // Glass-style shadow & glow
            if (isSelected) {
                ctx.shadowColor = `rgba(${glowRgb}, 0.55)`;
                ctx.shadowBlur = 16;
                ctx.shadowOffsetY = 0;
            } else if (isHovered) {
                ctx.shadowColor = `rgba(${glowRgb}, 0.40)`;
                ctx.shadowBlur = 12;
                ctx.shadowOffsetY = 2;
            } else {
                ctx.shadowColor = 'rgba(0,0,0,0.06)';
                ctx.shadowBlur = 6;
                ctx.shadowOffsetY = 3;
            }

            ctx.fillStyle = fill;
            ctx.fill();

            // Distinctive border stroke
            ctx.lineWidth = isSelected ? lineWidth + 1.2 : isHovered ? lineWidth + 0.6 : lineWidth;
            ctx.strokeStyle = stroke;
            ctx.stroke();
            ctx.restore();
        };

        // Draw diamond decision node with glassmorphic depth
        const drawDiamond = (
            cx: number,
            cy: number,
            hw: number,
            hh: number,
            fill: string,
            stroke: string,
            lineWidth: number,
            isHovered: boolean,
            isSelected: boolean,
            glowRgb: string
        ) => {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(cx, cy - hh);
            ctx.lineTo(cx + hw, cy);
            ctx.lineTo(cx, cy + hh);
            ctx.lineTo(cx - hw, cy);
            ctx.closePath();

            if (isSelected) {
                ctx.shadowColor = `rgba(${glowRgb}, 0.60)`;
                ctx.shadowBlur = 18;
                ctx.shadowOffsetY = 0;
            } else if (isHovered) {
                ctx.shadowColor = `rgba(${glowRgb}, 0.45)`;
                ctx.shadowBlur = 14;
                ctx.shadowOffsetY = 2;
            } else {
                ctx.shadowColor = 'rgba(0,0,0,0.06)';
                ctx.shadowBlur = 6;
                ctx.shadowOffsetY = 3;
            }

            ctx.fillStyle = fill;
            ctx.fill();

            ctx.lineWidth = isSelected ? lineWidth + 1.4 : isHovered ? lineWidth + 0.8 : lineWidth;
            ctx.strokeStyle = stroke;
            ctx.stroke();
            ctx.restore();
        };

        // Draw connector arrow
        const drawConnector = (
            points: Array<[number, number]>,
            strokeColor: string,
            lineWidth: number = 1.4,
            isDashed: boolean = false
        ) => {
            if (!points || points.length < 2) return;
            const start = points[0];
            if (!start) return;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(start[0], start[1]);
            for (let i = 1; i < points.length; i++) {
                const pt = points[i];
                if (pt) {
                    ctx.lineTo(pt[0], pt[1]);
                }
            }
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            if (isDashed) {
                ctx.setLineDash([4, 3]);
            }
            ctx.stroke();

            // Arrowhead
            const last = points[points.length - 1];
            const prev = points[points.length - 2];
            if (last && prev) {
                const angle = Math.atan2(last[1] - prev[1], last[0] - prev[0]);
                const headLen = 7.5;
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.moveTo(last[0], last[1]);
                ctx.lineTo(
                    last[0] - headLen * Math.cos(angle - Math.PI / 6),
                    last[1] - headLen * Math.sin(angle - Math.PI / 6)
                );
                ctx.lineTo(
                    last[0] - headLen * Math.cos(angle + Math.PI / 6),
                    last[1] - headLen * Math.sin(angle + Math.PI / 6)
                );
                ctx.closePath();
                ctx.fillStyle = strokeColor;
                ctx.fill();
            }

            ctx.restore();
        };

        // Draw pill text label on connectors
        const drawPillLabel = (
            x: number,
            y: number,
            text: string,
            bgColor: string,
            textColor: string,
            borderColor: string
        ) => {
            ctx.save();
            ctx.font = '600 9.5px system-ui, -apple-system, sans-serif';
            const metrics = ctx.measureText(text);
            const w = metrics.width + 12;
            const h = 18;
            const px = x - w / 2;
            const py = y - h / 2;

            ctx.beginPath();
            ctx.roundRect(px, py, w, h, 9);
            ctx.fillStyle = bgColor;
            ctx.fill();
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, x, y);
            ctx.restore();
        };

        // Main Render Loop
        const render = (currentTime: number) => {
            const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
            lastTime = currentTime;

            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            const isDark = document.documentElement.classList.contains('dark');

            // --- 1. DRAW 4 FROSTED GLASS STAGE COLUMNS ---
            const STAGE_COLUMNS = [
                { 
                    num: '01',
                    title: 'SUBMISSION & SCREENING', 
                    x: 20, 
                    w: 215, 
                    fillLight: 'rgba(248,250,252,0.75)', 
                    fillDark: 'rgba(15,23,42,0.45)',
                    borderLight: 'rgba(203,213,225,0.7)',
                    borderDark: 'rgba(51,65,85,0.5)'
                },
                { 
                    num: '02',
                    title: 'DOUBLE-BLIND PEER REVIEW', 
                    x: 255, 
                    w: 235, 
                    fillLight: 'rgba(248,250,252,0.75)', 
                    fillDark: 'rgba(15,23,42,0.45)',
                    borderLight: 'rgba(203,213,225,0.7)',
                    borderDark: 'rgba(51,65,85,0.5)'
                },
                { 
                    num: '03',
                    title: 'EDITORIAL DECISION HUB', 
                    x: 510, 
                    w: 305, 
                    fillLight: 'rgba(248,250,252,0.75)', 
                    fillDark: 'rgba(15,23,42,0.45)',
                    borderLight: 'rgba(203,213,225,0.7)',
                    borderDark: 'rgba(51,65,85,0.5)'
                },
                { 
                    num: '04',
                    title: 'PUBLICATION & INDEXING', 
                    x: 830, 
                    w: 230, 
                    fillLight: 'rgba(248,250,252,0.75)', 
                    fillDark: 'rgba(15,23,42,0.45)',
                    borderLight: 'rgba(203,213,225,0.7)',
                    borderDark: 'rgba(51,65,85,0.5)'
                }
            ];

            STAGE_COLUMNS.forEach((col) => {
                ctx.save();
                ctx.beginPath();
                ctx.roundRect(col.x, 8, col.w, CANVAS_HEIGHT - 16, 14);
                
                const grad = ctx.createLinearGradient(col.x, 8, col.x, CANVAS_HEIGHT);
                if (isDark) {
                    grad.addColorStop(0, 'rgba(30,41,59,0.55)');
                    grad.addColorStop(1, 'rgba(15,23,42,0.30)');
                } else {
                    grad.addColorStop(0, 'rgba(255,255,255,0.85)');
                    grad.addColorStop(1, 'rgba(241,245,249,0.55)');
                }
                ctx.fillStyle = grad;
                ctx.fill();

                ctx.strokeStyle = isDark ? col.borderDark : col.borderLight;
                ctx.lineWidth = 1;
                ctx.stroke();

                // Stage Column Pill Header
                ctx.font = '700 9.5px system-ui, -apple-system, sans-serif';
                ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(`${col.num} • ${col.title}`, col.x + col.w / 2, 14);
                ctx.restore();
            });

            // --- 2. DRAW CONNECTORS & LABELS ---

            // Connector 1: Author Submits -> Screen Decision (Down)
            drawConnector([[125, 121], [125, 155]], isDark ? '#64748b' : '#94a3b8');

            // Connector 2: Screen Decision -> Desk Rejection (Down)
            drawConnector([[125, 235], [125, 320]], '#f43f5e', 1.5);
            drawPillLabel(
                125,
                277,
                'Out of Scope / Flawed',
                isDark ? '#2a1215' : '#fff1f2',
                '#e11d48',
                isDark ? '#4c1d24' : '#fecdd3'
            );

            // Connector 3: Screen Decision -> Assign Reviewers (Right)
            drawConnector([[190, 195], [275, 195]], isDark ? '#64748b' : '#94a3b8');
            drawPillLabel(
                232,
                195,
                'Meets Scope',
                isDark ? '#06281e' : '#ecfdf5',
                '#059669',
                isDark ? '#064e3b' : '#a7f3d0'
            );

            // Connector 4: Assign Reviewers -> Reviewers Evaluate (Up)
            drawConnector([[372, 167], [372, 121]], isDark ? '#64748b' : '#94a3b8');

            // Connector 5: Reviewers Evaluate -> Editorial Decision Hub
            drawConnector(
                [[470, 93], [540, 93], [540, 155]],
                isDark ? '#64748b' : '#94a3b8'
            );

            // Connector 6: Decision Hub -> Formal Rejection (Up)
            drawConnector([[610, 110], [610, 72]], '#f43f5e', 1.5);
            drawPillLabel(
                610,
                91,
                'Reject',
                isDark ? '#2a1215' : '#fff1f2',
                '#e11d48',
                isDark ? '#4c1d24' : '#fecdd3'
            );

            // Connector 7: Decision Hub -> Minor Revision (Down-Left)
            drawConnector([[580, 185], [580, 245]], '#f59e0b', 1.4);
            drawPillLabel(
                580,
                215,
                'Minor',
                isDark ? '#291804' : '#fffbeb',
                '#d97706',
                isDark ? '#451a03' : '#fde68a'
            );

            // Connector 8: Minor Revision -> Editor Verifies (Right)
            drawConnector([[685, 271], [700, 271]], '#f59e0b', 1.4);

            // Connector 9: Editor Verifies -> Acceptance (Up fast track)
            drawConnector(
                [[755, 245], [755, 93], [840, 93]],
                '#10b981',
                1.4,
                true
            );
            drawPillLabel(
                785,
                93,
                'Verified',
                isDark ? '#06281e' : '#ecfdf5',
                '#059669',
                isDark ? '#064e3b' : '#a7f3d0'
            );

            // Connector 10: Decision Hub -> Major Revision (Down)
            drawConnector([[610, 200], [610, 340]], '#f97316', 1.4);
            drawPillLabel(
                610,
                270,
                'Major',
                isDark ? '#291804' : '#fff7ed',
                '#ea580c',
                isDark ? '#431407' : '#ffedd5'
            );

            // Connector 11: Major Revision -> Re-review loop (Left to Stage 2)
            drawConnector(
                [[520, 366], [372, 366], [372, 223]],
                '#f97316',
                1.4,
                true
            );
            drawPillLabel(
                446,
                366,
                'Re-Review Cycle',
                isDark ? '#291804' : '#fff7ed',
                '#ea580c',
                isDark ? '#431407' : '#fed7aa'
            );

            // Connector 12: Decision Hub -> Final Acceptance (Right)
            drawConnector([[680, 155], [820, 155], [820, 93], [840, 93]], '#10b981', 1.6);
            drawPillLabel(
                750,
                155,
                'Accept',
                isDark ? '#06281e' : '#ecfdf5',
                '#059669',
                isDark ? '#064e3b' : '#a7f3d0'
            );

            // Connector 13: Final Acceptance -> CrossRef DOI
            drawConnector([[942, 121], [942, 185]], '#10b981', 1.5);

            // Connector 14: CrossRef DOI -> Published Online
            drawConnector([[942, 243], [942, 310]], '#10b981', 1.5);

            // --- 3. MATHEMATICALLY EXACT CONTINUOUS STREAMING PARTICLES WITH COMET TRAILS ---
            if (isPlayingRef.current) {
                streams.forEach((stream) => {
                    const pathData = compiledPaths[stream.pathIndex];
                    if (!pathData) return;

                    stream.distance += stream.speed * dt;

                    const head = getPointAtDistance(pathData, stream.distance);
                    const tail1 = getPointAtDistance(pathData, stream.distance - 7);
                    const tail2 = getPointAtDistance(pathData, stream.distance - 14);
                    const tail3 = getPointAtDistance(pathData, stream.distance - 21);

                    ctx.save();

                    // Tail 3
                    ctx.beginPath();
                    ctx.arc(tail3.x, tail3.y, stream.radius * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = stream.glowColor.replace('0.85', '0.20');
                    ctx.fill();

                    // Tail 2
                    ctx.beginPath();
                    ctx.arc(tail2.x, tail2.y, stream.radius * 0.6, 0, Math.PI * 2);
                    ctx.fillStyle = stream.glowColor.replace('0.85', '0.40');
                    ctx.fill();

                    // Tail 1
                    ctx.beginPath();
                    ctx.arc(tail1.x, tail1.y, stream.radius * 0.8, 0, Math.PI * 2);
                    ctx.fillStyle = stream.glowColor.replace('0.85', '0.65');
                    ctx.fill();

                    // Head Bead with Radial Glow
                    ctx.beginPath();
                    ctx.arc(head.x, head.y, stream.radius, 0, Math.PI * 2);
                    ctx.fillStyle = stream.color;
                    ctx.shadowColor = stream.color;
                    ctx.shadowBlur = 10;
                    ctx.fill();

                    // Inner bright white pinpoint
                    ctx.beginPath();
                    ctx.arc(head.x, head.y, stream.radius * 0.45, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();

                    ctx.restore();
                });
            }

            // --- 4. DRAW NODES & DIAMONDS ---
            NODES.forEach((node) => {
                const isHovered = hoveredNodeId === node.id;
                const isSelected = selectedNodeId === node.id;

                let fill = isDark ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.95)';
                let stroke = isDark ? 'rgba(71,85,105,0.7)' : 'rgba(203,213,225,0.9)';
                let textColor = isDark ? '#f8fafc' : '#0f172a';
                let glowRgb = '59,130,246';

                if (node.type === 'reject') {
                    glowRgb = '244,63,94';
                    fill = isDark ? 'rgba(244,63,94,0.18)' : 'rgba(255,241,242,0.95)';
                    stroke = isHovered || isSelected ? '#f43f5e' : isDark ? 'rgba(244,63,94,0.6)' : '#fda4af';
                    textColor = isDark ? '#fda4af' : '#be123c';
                } else if (node.type === 'accept') {
                    glowRgb = '16,185,129';
                    fill = isDark ? 'rgba(16,185,129,0.16)' : 'rgba(236,253,245,0.95)';
                    stroke = isHovered || isSelected ? '#10b981' : isDark ? 'rgba(16,185,129,0.6)' : '#6ee7b7';
                    textColor = isDark ? '#6ee7b7' : '#047857';
                } else if (node.type === 'revision') {
                    glowRgb = '245,158,11';
                    fill = isDark ? 'rgba(245,158,11,0.15)' : 'rgba(255,251,235,0.95)';
                    stroke = isHovered || isSelected ? '#f59e0b' : isDark ? 'rgba(245,158,11,0.6)' : '#fcd34d';
                    textColor = isDark ? '#fde68a' : '#b45309';
                } else if (node.type === 'decision') {
                    glowRgb = '139,92,246';
                    fill = isDark ? 'rgba(139,92,246,0.20)' : 'rgba(245,243,255,0.95)';
                    stroke = isHovered || isSelected ? '#8b5cf6' : isDark ? 'rgba(139,92,246,0.6)' : '#c4b5fd';
                    textColor = isDark ? '#d8b4fe' : '#6d28d9';
                } else {
                    glowRgb = '59,130,246';
                    if (isHovered || isSelected) {
                        stroke = '#3b82f6';
                    }
                }

                if (node.shape === 'diamond') {
                    const hw = node.w / 2;
                    const hh = node.h / 2;
                    drawDiamond(node.x, node.y, hw, hh, fill, stroke, 1.5, isHovered, isSelected, glowRgb);

                    ctx.save();
                    ctx.fillStyle = textColor;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = isHovered || isSelected ? '700 12px system-ui, sans-serif' : '600 12px system-ui, sans-serif';
                    const totalH = node.lines.length * 15;
                    const startY = node.y - totalH / 2 + 7.5;
                    node.lines.forEach((line, idx) => {
                        ctx.fillText(line, node.x, startY + idx * 15);
                    });
                    ctx.restore();
                } else {
                    drawRoundedBox(node.x, node.y, node.w, node.h, 9, fill, stroke, 1.4, isHovered, isSelected, glowRgb);

                    ctx.save();
                    ctx.fillStyle = textColor;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = isHovered || isSelected ? '600 12px system-ui, sans-serif' : '500 12px system-ui, sans-serif';
                    const totalH = node.lines.length * 16;
                    const startY = node.y + (node.h - totalH) / 2 + 8;
                    node.lines.forEach((line, idx) => {
                        ctx.fillText(line, node.x + node.w / 2, startY + idx * 16);
                    });

                    if (node.id === 'crossref_doi') {
                        ctx.font = '700 8.5px system-ui, sans-serif';
                        ctx.fillStyle = isDark ? '#34d399' : '#059669';
                        ctx.fillText('• CrossRef Verified Plugin', node.x + node.w / 2, node.y + node.h - 9);
                    }

                    ctx.restore();
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationFrameId);
    }, [compiledPaths, hoveredNodeId, selectedNodeId]);

    // High DPI Canvas Scaling
    const syncCanvasScale = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = CANVAS_WIDTH * dpr;
        canvas.height = CANVAS_HEIGHT * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
        }
    }, []);

    useEffect(() => {
        syncCanvasScale();
        window.addEventListener('resize', syncCanvasScale);
        return () => window.removeEventListener('resize', syncCanvasScale);
    }, [syncCanvasScale]);

    // Hit-testing for hover & click
    const handlePointerAt = (clientX: number, clientY: number, select: boolean) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        const mouseX = (clientX - rect.left) * scaleX;
        const mouseY = (clientY - rect.top) * scaleY;

        const found = NODES.find((n) => {
            if (n.shape === 'diamond') {
                const hw = n.w / 2;
                const hh = n.h / 2;
                const dx = Math.abs(mouseX - n.x) / hw;
                const dy = Math.abs(mouseY - n.y) / hh;
                return dx + dy <= 1;
            }
            return mouseX >= n.x && mouseX <= n.x + n.w && mouseY >= n.y && mouseY <= n.y + n.h;
        });

        if (found) {
            canvas.style.cursor = 'pointer';
            setHoveredNodeId(found.id);
            if (select) {
                setSelectedNodeId(found.id);
                setActiveStageTab(found.stageNum);
            }
        } else {
            canvas.style.cursor = 'default';
            setHoveredNodeId(null);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        handlePointerAt(e.clientX, e.clientY, false);
    };

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        handlePointerAt(e.clientX, e.clientY, true);
    };

    // Touch Support for Mobile & Tablets
    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        const touch = e.touches[0];
        if (touch) {
            handlePointerAt(touch.clientX, touch.clientY, true);
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-3.5 select-none"
            aria-labelledby="flowchart-title"
        >
            {/* Header with Standard Stage Badges & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/70 pb-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="badge-brand text-[9px] font-semibold px-2 py-0.5 rounded-md">
                            COPE Editorial Protocol
                        </Badge>
                        <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-xs shadow-emerald-500/50" />
                            Live 60FPS Pipeline
                        </span>
                    </div>
                    <h3 id="flowchart-title" className="text-base sm:text-lg font-bold text-foreground m-0 flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-primary" /> Peer Review & Editorial Lifecycle
                    </h3>
                </div>

                {/* Visual Legend Key & Play/Pause */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-white/70 dark:bg-muted/40 backdrop-blur-md rounded-xl text-[10px] text-muted-foreground font-medium border border-border/70 shadow-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 shadow-xs shadow-blue-500/40" /> Process
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rotate-45 rounded-2xs bg-purple-500 shadow-xs shadow-purple-500/40" /> Decision
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 shadow-xs shadow-amber-500/40" /> Revision
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shadow-xs shadow-emerald-500/40" /> Accept/DOI
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 shadow-xs shadow-rose-500/40" /> Rejection
                        </span>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="h-7.5 text-xs gap-1.5 px-3 bg-white/80 dark:bg-card/80 backdrop-blur-md text-foreground cursor-pointer rounded-xl border-border/80 shadow-xs hover:border-primary/50 transition-all"
                        title={isPlaying ? "Pause flow particles" : "Resume flow particles"}
                    >
                        {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
                        <span className="text-[11px] font-medium">{isPlaying ? "Pause Flow" : "Play Flow"}</span>
                    </Button>
                </div>
            </div>

            {/* Mobile / Tablet Stage Quick Switcher Bar */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar pb-1">
                <div className="flex items-center gap-1.5 shrink-0">
                    {[
                        { num: '01', label: '01. Submission' },
                        { num: '02', label: '02. Peer Review' },
                        { num: '03', label: '03. Decision' },
                        { num: '04', label: '04. Publication & DOI' }
                    ].map((stage) => {
                        const isCurrent = activeStageTab === stage.num;
                        return (
                            <button
                                key={stage.num}
                                type="button"
                                onClick={() => scrollToStage(stage.num)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                                    isCurrent
                                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                        : 'bg-white/80 dark:bg-card/60 text-muted-foreground hover:text-foreground border-border/70 hover:bg-muted/50'
                                }`}
                            >
                                {stage.label}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap sm:hidden shrink-0">
                    <Smartphone className="w-3 h-3 text-primary animate-pulse" />
                    <span>Swipe to explore</span>
                </div>
            </div>

            {/* High-Performance Glassmorphic Canvas Container with Smooth Inertial Scrolling */}
            <div
                ref={containerRef}
                className="w-full overflow-x-auto custom-scrollbar relative bg-white/60 dark:bg-slate-950/40 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-white/10 p-2.5 sm:p-3.5 shadow-xl shadow-slate-900/5 dark:shadow-black/30 touch-pan-x"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {/* Ambient Radial Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 pointer-events-none rounded-3xl" />

                <div className="min-w-[860px] max-w-full flex items-center justify-center relative z-10">
                    <canvas
                        ref={canvasRef}
                        onMouseMove={handleMouseMove}
                        onClick={handleClick}
                        onTouchStart={handleTouchStart}
                        style={{
                            width: '100%',
                            maxWidth: `${CANVAS_WIDTH}px`,
                            height: 'auto',
                            aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`
                        }}
                        className="block rounded-2xl cursor-default"
                    />
                </div>
            </div>

            {/* Bottom Interactive Stage Inspector Card with Rich Glassmorphism */}
            <div className="p-4 sm:p-5 bg-white/80 dark:bg-card/70 backdrop-blur-xl border border-border/80 rounded-2xl space-y-3 shadow-lg shadow-slate-900/5 dark:shadow-black/20 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/60 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] font-semibold bg-muted/70 text-foreground px-2 py-0.5 rounded-md">
                            Stage {activeNode.stageNum}
                        </Badge>
                        <h4 className="text-sm font-semibold text-foreground m-0 flex items-center gap-1.5">
                            {activeNode.title}
                        </h4>
                        {activeNode.type === 'accept' && (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-semibold shadow-xs shadow-emerald-600/30">
                                Acceptance & DOI
                            </Badge>
                        )}
                        {activeNode.type === 'decision' && (
                            <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-semibold shadow-xs shadow-purple-600/30">
                                Decision Checkpoint
                            </Badge>
                        )}
                        {activeNode.type === 'reject' && (
                            <Badge className="bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-semibold shadow-xs shadow-rose-600/30">
                                Rejection Point
                            </Badge>
                        )}
                        {activeNode.type === 'revision' && (
                            <Badge variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-400 text-[9px] font-semibold bg-amber-50 dark:bg-amber-950/30">
                                Revision Pathway
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium shrink-0">
                        <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">
                            <Clock className="w-3.5 h-3.5 text-primary" /> {activeNode.timeline}
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">
                            <UserCheck className="w-3.5 h-3.5 text-secondary" /> {activeNode.actor}
                        </span>
                    </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground m-0 leading-relaxed font-normal">
                    {activeNode.desc}
                </p>

                {/* Sub-criteria details list */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                    {activeNode.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-foreground/80 bg-slate-50/80 dark:bg-muted/30 p-2 rounded-lg border border-border/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <span className="leading-snug">{detail}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}
