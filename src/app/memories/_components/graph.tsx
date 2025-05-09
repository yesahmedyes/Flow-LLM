"use client";

import { useEffect, useRef, useMemo, useCallback, useImperativeHandle, forwardRef } from "react";
import * as d3 from "d3";

import colors from "tailwindcss/colors";
import { useTheme } from "next-themes";
import type { GraphTriplet, IdValue, GraphNode } from "~/lib/types/graph";
import { getNodeColor as getNodeColorByLabel } from "~/lib/utils/nodeColors";

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  value: string;
  primaryLabel?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

type NodeSource = string | NodeDatum;

interface LinkDatum {
  source: NodeSource;
  target: NodeSource;
  relations: string[];
  relationData: IdValue[];
  curveStrength: number;
}

function getNodeId(node: NodeSource): string {
  return typeof node === "string" ? node : node.id;
}

function getNodeX(node: NodeSource): number | undefined {
  return typeof node === "string" ? undefined : node.x;
}

function getNodeY(node: NodeSource): number | undefined {
  return typeof node === "string" ? undefined : node.y;
}

interface DragEvent extends d3.D3DragEvent<SVGGElement, NodeDatum, NodeDatum> {
  sourceEvent: MouseEvent & {
    target: Element;
  };
}

interface CustomEventWithTarget {
  stopPropagation: () => void;
  target?: {
    closest: (selector: string) => Element | null;
  };
}

interface GraphProps {
  triplets: GraphTriplet[];
  width: number;
  height: number;
  zoomOnMount: boolean;
  onNodeClick: (nodeId: string) => void;
  onEdgeClick: (edgeId: string) => void;
  onBlur: () => void;
  labelColorMap: Map<string, number>;
}

export interface GraphRef {
  zoomToLinkById: (linkId: string) => void;
}

export const Graph = forwardRef<GraphRef, GraphProps>((props, ref) => {
  const { triplets, width, height, zoomOnMount, onNodeClick, onEdgeClick, onBlur, labelColorMap } = props;

  const svgRef = useRef<SVGSVGElement>(null);
  const { resolvedTheme: themeMode } = useTheme();

  const resetLinksRef = useRef<(() => void) | null>(null);
  const resetNodesRef = useRef<(() => void) | null>(null);

  const handleLinkClickRef = useRef<((event: CustomEventWithTarget, d: LinkDatum, relation: IdValue) => void) | null>(
    null,
  );

  const simulationRef = useRef<d3.Simulation<NodeDatum, undefined> | null>(null);

  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const isInitializedRef = useRef(false);

  const graphRef = useRef<GraphRef>({
    zoomToLinkById: (linkId: string) => {
      if (!svgRef.current || !resetLinksRef.current || !resetNodesRef.current || !handleLinkClickRef.current) return;
      const svgElement = d3.select(svgRef.current);
      const linkGroups = svgElement.selectAll<SVGGElement, LinkDatum>("g > g");

      let found = false;

      linkGroups.each(function (d: LinkDatum) {
        if (found) return;

        if (d?.relationData) {
          const relation = d.relationData.find((r: IdValue) => r.id === linkId);
          if (relation) {
            found = true;
            const resetLinks = resetLinksRef.current;
            const resetNodes = resetNodesRef.current;
            const handleLinkClick = handleLinkClickRef.current;

            if (resetLinks) resetLinks();
            if (resetNodes) resetNodes();
            if (handleLinkClick)
              handleLinkClick(
                {
                  stopPropagation: () => {
                    return;
                  },
                },
                d,
                relation,
              );
          }
        }
      });

      if (!found) {
        console.warn(`Link with id ${linkId} not found`);
      }
    },
  });

  useImperativeHandle(ref, () => graphRef.current);

  const theme = useMemo(
    () => ({
      node: {
        fill: colors.pink[500],
        stroke: themeMode === "dark" ? colors.slate[100] : colors.slate[900],
        hover: colors.blue[400],
        text: themeMode === "dark" ? colors.slate[100] : colors.slate[900],
        selected: colors.blue[500],
        dimmed: colors.pink[300],
      },
      link: {
        stroke: themeMode === "dark" ? colors.slate[600] : colors.slate[400],
        selected: colors.blue[400],
        dimmed: themeMode === "dark" ? colors.slate[800] : colors.slate[200],
        label: {
          bg: themeMode === "dark" ? colors.slate[800] : colors.slate[200],
          text: themeMode === "dark" ? colors.slate[100] : colors.slate[900],
        },
      },
      background: colors.transparent,
      controls: {
        bg: themeMode === "dark" ? colors.slate[800] : colors.slate[200],
        hover: themeMode === "dark" ? colors.slate[700] : colors.slate[300],
        text: themeMode === "dark" ? colors.slate[100] : colors.slate[900],
      },
    }),
    [themeMode],
  );

  const nodeDataMap = useMemo(() => {
    const result = new Map<string, GraphNode>();

    triplets.forEach((triplet) => {
      result.set(triplet.source.id, triplet.source);
      result.set(triplet.target.id, triplet.target);
    });

    return result;
  }, [triplets]);

  const getNodeColor = useCallback(
    (node: NodeDatum | null): string => {
      if (!node) {
        return getNodeColorByLabel(null, themeMode === "dark", labelColorMap);
      }

      const nodeData = nodeDataMap.get(node.id) ?? node;

      const primaryLabel = nodeData.primaryLabel;

      return getNodeColorByLabel(primaryLabel, themeMode === "dark", labelColorMap);
    },
    [labelColorMap, nodeDataMap, themeMode],
  );

  const { nodes, links } = useMemo(() => {
    const nodes: NodeDatum[] = Array.from(new Set(triplets.flatMap((t) => [t.source.id, t.target.id]))).map((id) => {
      const nodeData = triplets.find((t) => t.source.id === id || t.target.id === id);
      const value = nodeData ? (nodeData.source.id === id ? nodeData.source.value : nodeData.target.value) : id;
      return {
        id,
        value,
      };
    });

    const linkGroups = triplets.reduce(
      (groups, triplet) => {
        if (triplet.relation.type === "_isolated_node_") {
          return groups;
        }

        let key = `${triplet.source.id}-${triplet.target.id}`;
        const reverseKey = `${triplet.target.id}-${triplet.source.id}`;

        if (groups[reverseKey]) {
          key = reverseKey;
        }

        groups[key] ??= {
          source: triplet.source.id,
          target: triplet.target.id,
          relations: [],
          relationData: [],
          curveStrength: 0,
        };

        groups[key]?.relations.push(triplet.relation.value);
        groups[key]?.relationData.push(triplet.relation);

        return groups;
      },
      {} as Record<string, LinkDatum>,
    );

    return {
      nodes,
      links: Object.values(linkGroups),
    };
  }, [triplets]);

  useEffect(() => {
    if (isInitializedRef.current || !svgRef.current) return;

    isInitializedRef.current = true;

    const svgElement = d3.select<SVGSVGElement, unknown>(svgRef.current);
    svgElement.selectAll("*").remove();

    const g = svgElement.append("g");

    const drag = (simulation: d3.Simulation<NodeDatum, undefined>) => {
      const originalSettings = {
        velocityDecay: 0.4,
        alphaDecay: 0.05,
      };

      function dragstarted(event: DragEvent) {
        if (!event.active) {
          simulation.velocityDecay(0.7).alphaDecay(0.1).alphaTarget(0.1).restart();
        }
        const target = event.sourceEvent.target as Element;
        const parentNode = target.closest("g");
        if (parentNode) {
          d3.select(parentNode).select("circle").attr("stroke", theme.node.hover).attr("stroke-width", 3);
        }

        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: DragEvent) {
        event.subject.x = event.x;
        event.subject.y = event.y;
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: DragEvent) {
        if (!event.active) {
          simulation
            .velocityDecay(originalSettings.velocityDecay)
            .alphaDecay(originalSettings.alphaDecay)
            .alphaTarget(0);
        }

        event.subject.fx = event.x;
        event.subject.fy = event.y;

        const target = event.sourceEvent.target as Element;
        const parentNode = target.closest("g");
        if (parentNode) {
          d3.select(parentNode).select("circle").attr("stroke", theme.node.stroke).attr("stroke-width", 2);
        }
      }

      return d3.drag<SVGGElement, NodeDatum>().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    };

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr("transform", event.transform.toString());
      });

    zoomRef.current = zoom;

    svgElement.call(zoom);
    svgElement.call((selection) => zoom.transform.call(zoom, selection, d3.zoomIdentity.scale(0.8)));

    const nodeIdSet = new Set(nodes.map((n: NodeDatum) => n.id));
    const linkedNodeIds = new Set<string>();

    links.forEach((link: LinkDatum) => {
      const sourceId = typeof link.source === "string" ? link.source : link.source.id;
      const targetId = typeof link.target === "string" ? link.target : link.target.id;
      linkedNodeIds.add(sourceId);
      linkedNodeIds.add(targetId);
    });

    const isolatedNodeIds = new Set<string>();
    nodeIdSet.forEach((nodeId: string) => {
      if (!linkedNodeIds.has(nodeId)) {
        isolatedNodeIds.add(nodeId);
      }
    });

    const simulation = d3
      .forceSimulation(nodes as NodeDatum[])
      .force(
        "link",
        d3
          .forceLink(links as d3.SimulationLinkDatum<d3.SimulationNodeDatum>[])
          .id((d) => {
            const node = d as d3.SimulationNodeDatum & { id: string };
            return node.id;
          })
          .distance(200)
          .strength(0.2),
      )
      .force(
        "charge",
        d3
          .forceManyBody()
          .strength((d) => {
            const node = d as d3.SimulationNodeDatum & { id: string };
            return isolatedNodeIds.has(node.id) ? -500 : -3000;
          })
          .distanceMin(20)
          .distanceMax(500)
          .theta(0.8),
      )
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force("collide", d3.forceCollide().radius(50).strength(0.3).iterations(5))
      .force(
        "isolatedGravity",
        d3
          .forceRadial(
            100, // distance from center
            width / 2, // center x
            height / 2, // center y
          )
          .strength((d) => {
            const node = d as d3.SimulationNodeDatum & { id: string };
            return isolatedNodeIds.has(node.id) ? 0.15 : 0.01;
          }),
      )
      .velocityDecay(0.4)
      .alphaDecay(0.05)
      .alphaMin(0.001);

    simulationRef.current = simulation;

    const link = g.append("g").selectAll<SVGGElement, LinkDatum>("g").data(links).join("g");

    resetLinksRef.current = () => {
      link.selectAll("path").attr("stroke", theme.link.stroke).attr("stroke-opacity", 0.6).attr("stroke-width", 1);

      link.selectAll(".link-label rect").attr("fill", theme.link.label.bg);

      link.selectAll(".link-label text").attr("fill", theme.link.label.text);
    };

    const node = g
      .append("g")
      .selectAll<SVGGElement, NodeDatum>("g")
      .data(nodes)
      .join("g")
      .call(
        drag(simulation) as unknown as (selection: d3.Selection<SVGGElement, NodeDatum, SVGGElement, unknown>) => void,
      )
      .attr("cursor", "pointer");

    resetNodesRef.current = () => {
      node
        .selectAll("circle")
        .attr("fill", function () {
          return getNodeColor(d3.select(this).datum() as NodeDatum);
        })
        .attr("stroke", theme.node.stroke)
        .attr("stroke-width", 1);
    };

    handleLinkClickRef.current = (event: CustomEventWithTarget, d: LinkDatum, relation: IdValue) => {
      if (event.stopPropagation) {
        event.stopPropagation();
      }

      if (resetLinksRef.current) resetLinksRef.current();
      if (onEdgeClick) onEdgeClick(relation.id);

      link.selectAll("path").attr("stroke", theme.link.stroke).attr("stroke-opacity", 0.6).attr("stroke-width", 1);

      node
        .selectAll("circle")
        .attr("fill", function () {
          return getNodeColor(d3.select(this).datum() as NodeDatum);
        })
        .attr("stroke", theme.node.stroke)
        .attr("stroke-width", 1);

      const linkGroup = event.target?.closest("g")
        ? d3.select<Element, unknown>(event.target.closest("g")!)
        : link.filter((l: LinkDatum) => l === d);

      // Use @ts-expect-error for d3.js selection that's difficult to type correctly
      // @ts-expect-error - d3 selection type incompatibilities
      const paths = linkGroup.selectAll("path");
      paths.attr("stroke", theme.link.selected).attr("stroke-opacity", 1).attr("stroke-width", 2);

      // @ts-expect-error - d3 selection type incompatibilities
      const labelRects = linkGroup.selectAll(".link-label rect");
      const labelRectNode = labelRects.node();
      if (labelRectNode) {
        labelRects.attr("fill", theme.link.selected);
      }

      // @ts-expect-error - d3 selection type incompatibilities
      const labelTexts = linkGroup.selectAll(".link-label text");
      const labelTextNode = labelTexts.node();
      if (labelTextNode) {
        labelTexts.attr("fill", theme.node.text);
      }

      node.selectAll("circle").each(function () {
        const nodeData = d3.select(this).datum() as NodeDatum;
        const sourceId = getNodeId(d.source);
        const targetId = getNodeId(d.target);

        if (nodeData.id === sourceId || nodeData.id === targetId) {
          d3.select(this).attr("fill", theme.node.selected).attr("stroke", theme.node.selected).attr("stroke-width", 2);
        }
      });

      const sourceNode = d.source;
      const targetNode = d.target;

      const sourceX = getNodeX(sourceNode);
      const sourceY = getNodeY(sourceNode);
      const targetX = getNodeX(targetNode);
      const targetY = getNodeY(targetNode);

      if (
        sourceX !== undefined &&
        sourceY !== undefined &&
        targetX !== undefined &&
        targetY !== undefined &&
        zoomRef.current
      ) {
        const padding = 100;
        const minX = Math.min(sourceX, targetX) - padding;
        const minY = Math.min(sourceY, targetY) - padding;
        const maxX = Math.max(sourceX, targetX) + padding;
        const maxY = Math.max(sourceY, targetY) + padding;

        const boundWidth = maxX - minX;
        const boundHeight = maxY - minY;
        const scale = 0.9 * Math.min(width / boundWidth, height / boundHeight);
        const midX = (minX + maxX) / 2;
        const midY = (minY + maxY) / 2;

        if (isFinite(scale) && isFinite(midX) && isFinite(midY)) {
          const transform = d3.zoomIdentity.translate(width / 2 - midX * scale, height / 2 - midY * scale).scale(scale);

          svgElement
            .transition()
            .duration(750)
            .ease(d3.easeCubicInOut)
            .call(zoomRef.current.transform.bind(zoomRef.current), transform);
        }
      }
    };

    link.each(function (this: SVGGElement, d: LinkDatum) {
      const linkGroup = d3.select<SVGGElement, LinkDatum>(this);
      const relationCount = d.relations.length;

      const baseStrength = 0.2;
      const strengthStep = relationCount > 1 ? baseStrength / (relationCount - 1) : 0;

      d.relations.forEach((relation: string, index: number) => {
        const curveStrength = relationCount > 1 ? -baseStrength + index * strengthStep * 2 : 0;
        const fullRelation = d.relationData[index];

        if (!fullRelation) {
          return;
        }

        linkGroup
          .append("path")
          .attr("stroke", theme.link.stroke)
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", 1)
          .attr("fill", "none")
          .attr("data-curve-strength", curveStrength)
          .attr("cursor", "pointer")
          .attr("data-source", typeof d.source === "object" ? d.source.id : d.source)
          .attr("data-target", typeof d.target === "object" ? d.target.id : d.target)
          .on("click", (event) => {
            if (handleLinkClickRef.current) {
              handleLinkClickRef.current(event as unknown as CustomEventWithTarget, d, fullRelation);
            }
          });

        const labelGroup = linkGroup
          .append("g")
          .attr("class", "link-label")
          .attr("cursor", "pointer")
          .attr("data-curve-strength", curveStrength)
          .on("click", (event) => {
            if (handleLinkClickRef.current) {
              handleLinkClickRef.current(event as unknown as CustomEventWithTarget, d, fullRelation);
            }
          });

        labelGroup.append("rect").attr("fill", theme.link.label.bg).attr("rx", 4).attr("ry", 4).attr("opacity", 0.9);

        labelGroup
          .append("text")
          .attr("fill", theme.link.label.text)
          .attr("font-size", "8px")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("pointer-events", "none")
          .text(relation);

        labelGroup.attr("data-curve-strength", curveStrength);
      });
    });

    node
      .append("circle")
      .attr("r", 10)
      .attr("fill", (d: NodeDatum) => getNodeColor(d))
      .attr("stroke", theme.node.stroke)
      .attr("stroke-width", 1)
      .attr("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))")
      .attr("data-id", (d: NodeDatum) => d.id)
      .attr("cursor", "pointer");

    node
      .append("text")
      .attr("x", 15)
      .attr("y", "0.3em")
      .attr("text-anchor", "start")
      .attr("fill", theme.node.text)
      .attr("font-weight", "500")
      .attr("font-size", "12px")
      .text((d: NodeDatum) => d.value)
      .attr("cursor", "pointer");

    function handleNodeClick(event: MouseEvent, d: NodeDatum) {
      event.stopPropagation();

      if (resetLinksRef.current) resetLinksRef.current();
      if (resetNodesRef.current) resetNodesRef.current();

      const selectedNodeId = d.id;

      if (selectedNodeId && onNodeClick) {
        onNodeClick(selectedNodeId);

        const connectedLinks: { source: NodeDatum; target: NodeDatum }[] = [];
        const connectedNodes = new Set<NodeDatum>();

        const selectedNode = nodes.find((n: NodeDatum) => n.id === selectedNodeId);
        if (selectedNode) {
          connectedNodes.add(selectedNode);
        }

        link.selectAll("path").each(function () {
          const path = d3.select(this);
          const source = path.attr("data-source");
          const target = path.attr("data-target");

          if (source === selectedNodeId || target === selectedNodeId) {
            const sourceNode = nodes.find((n: NodeDatum) => n.id === source);
            const targetNode = nodes.find((n: NodeDatum) => n.id === target);

            if (sourceNode && targetNode) {
              connectedLinks.push({ source: sourceNode, target: targetNode });
              connectedNodes.add(sourceNode);
              connectedNodes.add(targetNode);
            }
          }
        });

        if (connectedNodes.size > 0 && zoomRef.current) {
          let minX = Infinity,
            minY = Infinity;
          let maxX = -Infinity,
            maxY = -Infinity;

          connectedNodes.forEach((node: NodeDatum) => {
            if (node.x !== undefined && node.y !== undefined) {
              minX = Math.min(minX, node.x);
              minY = Math.min(minY, node.y);
              maxX = Math.max(maxX, node.x);
              maxY = Math.max(maxY, node.y);
            }
          });

          const padding = 50;
          minX -= padding;
          minY -= padding;
          maxX += padding;
          maxY += padding;

          const boundWidth = maxX - minX;
          const boundHeight = maxY - minY;
          const scale = 0.9 * Math.min(width / boundWidth, height / boundHeight);
          const midX = (minX + maxX) / 2;
          const midY = (minY + maxY) / 2;

          if (isFinite(scale) && isFinite(midX) && isFinite(midY)) {
            const transform = d3.zoomIdentity
              .translate(width / 2 - midX * scale, height / 2 - midY * scale)
              .scale(scale);

            svgElement
              .transition()
              .duration(750)
              .ease(d3.easeCubicInOut)
              .call(zoomRef.current.transform.bind(zoomRef.current), transform);
          }
        }
      }
    }

    node.on("click", handleNodeClick as unknown as (this: SVGGElement, event: MouseEvent, d: NodeDatum) => void);

    const svgRefCurrent = svgRef.current;

    svgElement.on("click", function (this: SVGSVGElement, event: MouseEvent) {
      if (event.target === svgRefCurrent) {
        if (onBlur) onBlur();
        if (resetLinksRef.current) resetLinksRef.current();
        if (resetNodesRef.current) resetNodesRef.current();
      }
    });

    simulation.on("tick", () => {
      link.each(function (d: LinkDatum) {
        if (typeof d.source === "string" || !d.source.x) {
          const sourceNode = nodes.find((n) => n.id === (typeof d.source === "string" ? d.source : d.source.id));
          if (sourceNode) d.source = sourceNode;
        }

        if (typeof d.target === "string" || !d.target.x) {
          const targetNode = nodes.find((n) => n.id === (typeof d.target === "string" ? d.target : d.target.id));
          if (targetNode) d.target = targetNode;
        }

        const linkGroup = d3.select(this);

        linkGroup.selectAll("path").each(function () {
          const path = d3.select(this);
          const curveStrength = +path.attr("data-curve-strength") || 0;

          if (typeof d.source === "string" || typeof d.target === "string") {
            return;
          }

          const sourceX = d.source.x ?? 0;
          const sourceY = d.source.y ?? 0;
          const targetX = d.target.x ?? 0;
          const targetY = d.target.y ?? 0;

          if (d.source.id === d.target.id) {
            const radiusX = 40;
            const radiusY = 90;
            const offset = radiusY + 20;

            const cx = sourceX;
            const cy = sourceY - offset;
            const path_d = `M${sourceX},${sourceY} C${cx - radiusX},${cy} ${cx + radiusX},${cy} ${sourceX},${sourceY}`;

            path.attr("d", path_d);

            const labelGroup = linkGroup.selectAll(`.link-label[data-curve-strength="${curveStrength}"]`);
            labelGroup.attr("transform", `translate(${cx}, ${cy - 10})`);

            const text = labelGroup.select("text");
            const rect = labelGroup.select("rect");

            const textNode = text.node() as SVGTextElement | null;

            if (textNode) {
              try {
                const textBBox = textNode.getBBox();

                rect
                  .attr("x", -textBBox.width / 2 - 6)
                  .attr("y", -textBBox.height / 2 - 4)
                  .attr("width", textBBox.width + 12)
                  .attr("height", textBBox.height + 8);
              } catch (e) {
                console.warn("Failed to get text bounding box", e);
              }
            }
          } else {
            const dx = targetX - sourceX;
            const dy = targetY - sourceY;
            const dr = Math.sqrt(dx * dx + dy * dy);

            const midX = (sourceX + targetX) / 2;
            const midY = (sourceY + targetY) / 2;
            const normalX = -dy / dr;
            const normalY = dx / dr;
            const curveMagnitude = dr * curveStrength;
            const controlX = midX + normalX * curveMagnitude;
            const controlY = midY + normalY * curveMagnitude;

            const path_d = `M${sourceX},${sourceY} Q${controlX},${controlY} ${targetX},${targetY}`;

            path.attr("d", path_d);

            const pathNode = path.node() as SVGPathElement | null;

            if (pathNode) {
              try {
                const pathLength = pathNode.getTotalLength();
                const midPoint = pathNode.getPointAtLength(pathLength / 2);

                const labelGroup = linkGroup.selectAll(`.link-label[data-curve-strength="${curveStrength}"]`);

                const angle = (Math.atan2(targetY - sourceY, targetX - sourceX) * 180) / Math.PI;
                const rotationAngle = angle > 90 || angle < -90 ? angle - 180 : angle;

                if (midPoint) {
                  labelGroup.attr(
                    "transform",
                    `translate(${midPoint.x ?? 0}, ${midPoint.y ?? 0}) rotate(${rotationAngle})`,
                  );

                  const text = labelGroup.select("text");
                  const rect = labelGroup.select("rect");

                  const textNode = text.node() as SVGTextElement | null;

                  if (textNode) {
                    try {
                      const textBBox = textNode.getBBox();

                      rect
                        .attr("x", -textBBox.width / 2 - 6)
                        .attr("y", -textBBox.height / 2 - 4)
                        .attr("width", textBBox.width + 12)
                        .attr("height", textBBox.height + 8);
                    } catch (e) {
                      console.warn("Failed to get text bounding box", e);
                    }
                  }
                }
              } catch (e) {
                console.warn("Failed to calculate path measurements", e);
              }
            }
          }
        });
      });

      node.attr("transform", (d: NodeDatum) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    let hasInitialized = false;

    simulation.on("end", () => {
      if (hasInitialized || !zoomOnMount || !zoomRef.current) return;
      hasInitialized = true;

      const bounds = g.node()?.getBBox();
      if (bounds) {
        const fullWidth = width;
        const fullHeight = height;
        const currentWidth = bounds.width || 1;
        const currentHeight = bounds.height || 1;

        if (currentWidth > 0 && currentHeight > 0 && fullWidth > 0 && fullHeight > 0) {
          const midX = bounds.x + currentWidth / 2;
          const midY = bounds.y + currentHeight / 2;

          const scale = 0.8 * Math.min(fullWidth / currentWidth, fullHeight / currentHeight);

          if (isFinite(midX) && isFinite(midY) && isFinite(scale)) {
            const transform = d3.zoomIdentity
              .translate(fullWidth / 2 - midX * scale, fullHeight / 2 - midY * scale)
              .scale(scale);

            svgElement
              .transition()
              .duration(750)
              .ease(d3.easeCubicInOut)
              .call(zoomRef.current.transform.bind(zoomRef.current), transform);
          } else {
            console.warn("Invalid transform values:", { midX, midY, scale });

            const transform = d3.zoomIdentity.translate(fullWidth / 2, fullHeight / 2).scale(0.8);

            svgElement.call(zoomRef.current.transform.bind(zoomRef.current), transform);
          }
        }
      }
    });

    return () => {
      simulation.stop();
      const currentSvgRef = svgRef.current;
      if (currentSvgRef) {
        d3.select(currentSvgRef).on("click", null);
      }
      isInitializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || !isInitializedRef.current) return;

    const svgElement = d3.select<SVGSVGElement, unknown>(svgRef.current);

    svgElement.style("background-color", theme.background);

    svgElement
      .selectAll<SVGCircleElement, NodeDatum>("circle")
      .attr("fill", (d: NodeDatum) => getNodeColor(d))
      .attr("stroke", theme.node.stroke);

    svgElement.selectAll<SVGTextElement, unknown>("text").attr("fill", theme.node.text);

    svgElement.selectAll<SVGPathElement, unknown>("path").attr("stroke", theme.link.stroke).attr("stroke-opacity", 0.6);

    svgElement
      .selectAll<SVGPathElement, unknown>("path.selected")
      .attr("stroke", theme.link.selected)
      .attr("stroke-opacity", 1);

    svgElement.selectAll<SVGRectElement, unknown>(".link-label rect").attr("fill", theme.link.label.bg);
    svgElement.selectAll<SVGTextElement, unknown>(".link-label text").attr("fill", theme.link.label.text);
  }, [themeMode]);

  return (
    <svg
      className="mt-auto"
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        width: "100%",
        height: `${height}px`,
        backgroundColor: theme.background,
        borderRadius: "8px",
        cursor: "grab",
      }}
    />
  );
});

Graph.displayName = "Graph";
