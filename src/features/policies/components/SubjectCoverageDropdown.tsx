"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisciplineCoverage {
    id: string;
    branch: string;
    subSubjects: string[];
}

const DISCIPLINES_DATA: DisciplineCoverage[] = [
    {
        id: "cs-it",
        branch: "Computer Science & Information Technology",
        subSubjects: [
            "Software Engineering & Architecture",
            "Cloud, Edge & Distributed Computing",
            "Cybersecurity & Cryptography",
            "Blockchain & Distributed Ledgers",
            "Big Data Analytics & High-Performance Computing",
            "Computer Networks & 5G/6G Architectures",
            "Human-Computer Interaction & OS"
        ]
    },
    {
        id: "ai-data-science",
        branch: "Artificial Intelligence, Machine Learning & Data Science",
        subSubjects: [
            "Machine Learning Algorithms & Optimization",
            "Deep Learning & Neural Architectures",
            "Natural Language Processing (NLP) & LLMs",
            "Computer Vision & Pattern Recognition",
            "Generative AI & Foundation Models",
            "Predictive Analytics & Statistical Modeling",
            "Autonomous Systems & Explainable AI"
        ]
    },
    {
        id: "electronics-comm",
        branch: "Electronics & Communication Engineering",
        subSubjects: [
            "VLSI Design & Semiconductor Microelectronics",
            "Embedded Systems & Real-Time Firmware",
            "Digital Signal, Image & Speech Processing",
            "Wireless, Mobile & Optical Communications",
            "RF, Microwave & Antenna Engineering",
            "Power Electronics & Motor Drives",
            "Sensors, Transducers & Biomedical Electronics"
        ]
    },
    {
        id: "power-energy",
        branch: "Electrical Power & Clean Energy Systems",
        subSubjects: [
            "Smart Grids, Microgrids & Grid Modernization",
            "Renewable Generation (Solar, Wind, Biomass, Hydro)",
            "Electric Vehicles (EV), Drives & Charging Systems",
            "Energy Storage Technologies & Battery Management (BMS)",
            "Power System Protection & High Voltage Engineering"
        ]
    },
    {
        id: "mech-aero",
        branch: "Mechanical, Aerospace & Manufacturing Engineering",
        subSubjects: [
            "Computational Fluid Dynamics (CFD) & Aerodynamics",
            "Finite Element Analysis (FEA) & Solid Mechanics",
            "Thermal Engineering & Thermodynamics",
            "CAD / CAM / CAE & Precision Tooling",
            "Additive Manufacturing & Materials Processing",
            "Aerospace Propulsion & Flight Dynamics"
        ]
    },
    {
        id: "civil-structural",
        branch: "Civil, Structural & Environmental Engineering",
        subSubjects: [
            "Resilient Infrastructure & Structural Dynamics",
            "Geotechnical & Earthquake Engineering",
            "Sustainable Construction & Green Materials",
            "Water Resources, Hydrology & Waste Treatment",
            "Transportation Systems & Urban Mobility",
            "GIS, Remote Sensing & Environmental Monitoring"
        ]
    },
    {
        id: "robotics-iot",
        branch: "Internet of Things (IoT), Robotics & Automation",
        subSubjects: [
            "Autonomous Mobile Robots, Drones & UAVs",
            "Cyber-Physical Systems & Industry 4.0",
            "Smart Sensor Networks & Ambient IoT",
            "Mechatronics & Precision Motion Control",
            "Industrial Automation, PLC & SCADA Systems"
        ]
    },
    {
        id: "renewable-sustainability",
        branch: "Renewable Energy & Sustainable Technologies",
        subSubjects: [
            "Photovoltaic Materials & Next-Gen Solar Cells",
            "Green Hydrogen Production & Fuel Cells",
            "Carbon Capture, Utilization & Storage (CCUS)",
            "Circular Economy & Waste-to-Energy Systems",
            "Life Cycle Assessment (LCA) & Clean Engineering"
        ]
    },
    {
        id: "applied-sciences",
        branch: "Science & Applied Sciences",
        subSubjects: [
            "Applied Physics & Quantum Engineering",
            "Applied Chemistry & Electrochemistry",
            "Applied Mathematics & Numerical Optimization",
            "Materials Science & Nanotechnology",
            "Computational Biophysics & Environmental Science"
        ]
    },
    {
        id: "management-analytics",
        branch: "Management Studies & Technology Management",
        subSubjects: [
            "Technology & Innovation Strategy",
            "Supply Chain Engineering & Operations Research",
            "Management Information Systems (MIS)",
            "Business Analytics & Data-Driven Decision Making",
            "Engineering Economics & Project Management",
            "Digital Transformation & Technology Governance"
        ]
    }
];

export default function SubjectCoverageDropdown() {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const isExpanded = (id: string) => expandedIds.has(id);

    const toggleBranch = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const expandAll = () => {
        setExpandedIds(new Set(DISCIPLINES_DATA.map((d) => d.id)));
    };

    const collapseAll = () => {
        setExpandedIds(new Set());
    };

    const isAllExpanded = expandedIds.size === DISCIPLINES_DATA.length;

    return (
        <div className="space-y-3 pt-1">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pb-1 border-b border-border/40">
                <span className="text-muted-foreground/90">
                    Click any branch to expand or collapse accepted sub-subjects.
                </span>
                <button
                    type="button"
                    onClick={isAllExpanded ? collapseAll : expandAll}
                    className="font-medium text-primary hover:underline cursor-pointer transition-colors"
                >
                    {isAllExpanded ? "Collapse All" : "Expand All Branches"}
                </button>
            </div>

            {/* Academic Accordion List */}
            <div className="divide-y divide-border/60 border border-border/70 rounded-xl bg-card overflow-hidden shadow-2xs">
                {DISCIPLINES_DATA.map((item) => {
                    const expanded = isExpanded(item.id);

                    return (
                        <div
                            key={item.id}
                            className={cn(
                                "transition-colors duration-150",
                                expanded ? "bg-muted/20" : "hover:bg-muted/15"
                            )}
                        >
                            {/* Branch Header / Trigger */}
                            <button
                                type="button"
                                onClick={() => toggleBranch(item.id)}
                                aria-expanded={expanded}
                                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-primary/50 select-none"
                            >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                    <span className="font-semibold text-body-sm text-foreground">
                                        {item.branch}
                                    </span>
                                </div>

                                <div className="shrink-0 flex items-center gap-1.5 text-muted-foreground">
                                    <ChevronDown
                                        className={cn(
                                            "size-4 transition-transform duration-200 text-muted-foreground/70",
                                            expanded && "rotate-180 text-primary"
                                        )}
                                    />
                                </div>
                            </button>

                            {/* Dropdown Content */}
                            {expanded && (
                                <div className="px-4 pb-3 pt-1 border-t border-border/30 bg-background/50 animate-in fade-in duration-150">
                                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                                        {item.subSubjects.map((sub) => (
                                            <span
                                                key={sub}
                                                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-card text-foreground/85 border border-border/60 hover:border-primary/40 hover:text-primary transition-colors"
                                            >
                                                <span className="size-1 rounded-full bg-primary/60 mr-1.5 shrink-0" />
                                                {sub}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Interdisciplinary Callout */}
            <div className="p-3 rounded-xl bg-secondary/10 border-l-4 border-l-secondary text-foreground space-y-0.5">
                <p className="font-semibold text-body-sm text-secondary m-0">
                    Interdisciplinary Scope
                </p>
                <p className="text-caption text-foreground/90 m-0">
                    Submissions intersecting multiple engineering branches or combining technology with management and applied sciences are strongly encouraged.
                </p>
            </div>
        </div>
    );
}
