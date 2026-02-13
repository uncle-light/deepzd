/**
 * Optimize node — LangGraph-orchestrated optimization workflow
 */

import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import {
  optimizeContent,
  type OptimizationResult,
} from "../../application/content-optimizer";
import { GeoStrategy } from "../../domain/strategy-analyzer";

/** Map strategy string key to GeoStrategy enum */
const STRATEGY_MAP: Record<string, GeoStrategy> = {
  cite_sources: GeoStrategy.CITE_SOURCES,
  statistics: GeoStrategy.STATISTICS,
  quotations: GeoStrategy.QUOTATIONS,
  fluency: GeoStrategy.FLUENCY,
  authoritative: GeoStrategy.AUTHORITATIVE,
  technical_terms: GeoStrategy.TECHNICAL_TERMS,
  credibility: GeoStrategy.CREDIBILITY,
  unique_words: GeoStrategy.UNIQUE_WORDS,
  easy_to_understand: GeoStrategy.EASY_TO_UNDERSTAND,
};

const OptimizationWorkflowState = Annotation.Root({
  strategyKey: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  content: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  locale: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "zh",
  }),
  strategy: Annotation<GeoStrategy | null>({
    reducer: (_, y) => y,
    default: () => null,
  }),
  result: Annotation<OptimizationResult | null>({
    reducer: (_, y) => y,
    default: () => null,
  }),
});

type OptimizationWorkflowStateType = typeof OptimizationWorkflowState.State;

async function validateInputNode(
  state: OptimizationWorkflowStateType
): Promise<Partial<OptimizationWorkflowStateType>> {
  const strategy = STRATEGY_MAP[state.strategyKey];
  if (!strategy) {
    throw new Error(
      `Unknown strategy: ${state.strategyKey}. Valid: ${Object.keys(STRATEGY_MAP).join(", ")}`
    );
  }

  const content = state.content.trim();
  if (!content) {
    throw new Error("Content is required for optimization");
  }

  return {
    strategy,
    content,
    locale: state.locale === "en" ? "en" : "zh",
  };
}

async function optimizeNode(
  state: OptimizationWorkflowStateType
): Promise<Partial<OptimizationWorkflowStateType>> {
  if (!state.strategy) {
    throw new Error("Strategy is not set");
  }

  const result = await optimizeContent(state.content, state.strategy, state.locale);
  return { result };
}

const optimizationGraph = new StateGraph(OptimizationWorkflowState)
  .addNode("validate_input", validateInputNode)
  .addNode("run_optimization", optimizeNode)
  .addEdge(START, "validate_input")
  .addEdge("validate_input", "run_optimization")
  .addEdge("run_optimization", END)
  .compile({ name: "geo-optimization-workflow" });

/**
 * Run content optimization for a specific strategy
 */
export async function runOptimization(
  strategy: string,
  content: string,
  locale: string = "zh"
): Promise<OptimizationResult> {
  const finalState = await optimizationGraph.invoke({
    strategyKey: strategy,
    content,
    locale,
  });

  if (!finalState.result) {
    throw new Error(
      locale === "zh"
        ? "优化失败：未生成有效结果"
        : "Optimization failed: no valid result produced"
    );
  }

  return finalState.result;
}
