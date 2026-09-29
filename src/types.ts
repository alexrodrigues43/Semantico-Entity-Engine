export interface SemanticTriplet {
  subject: string;
  predicate: string;
  object: string;
}

export type RelationshipType =
  | "hierarchical"
  | "associative"
  | "causal"
  | "methodological"
  | "equivalence";

export interface SuggestedRelationship {
  id: string;
  sourceEntity: string;
  targetEntity: string;
  predicate: string;
  relationshipType: RelationshipType;
  confidence: number;
  reasoning: string;
  schemaProperty?: string;
  status?: "pending" | "applied" | "dismissed";
}

export interface WikidataMatch {
  wikidataId: string;
  label: string;
  description?: string;
  wikidataUrl: string;
  wikipediaUrl?: string;
  wikipediaEnUrl?: string;
  aliases?: string[];
  sameAsUrls: string[];
  confidence: number;
  googleMid?: string;
  googleKgUrl?: string;
}

export interface SeoEntityDefinition {
  id: string;
  entity: string;
  category: string;
  definition: string;
  shortSummary?: string;
  sources: string[];
  sourcesString?: string;
  semanticTriplets?: SemanticTriplet[];
  lsiKeywords?: string[];
  schemaType?: string;
  jsonLd?: any;
  sameAs?: string[];
  wikidataId?: string;
  wikidataUrl?: string;
  wikipediaUrl?: string;
  wikidataDescription?: string;
  googleMid?: string;
  googleKgUrl?: string;
  salienceScore?: number; // 0 to 100
  salienceLevel?: "central" | "supporting" | "peripheral";
  slug?: string;
  modelUsed?: string;
  createdAt?: string;
  status?: "idle" | "generating" | "completed" | "error";
  errorMessage?: string;
}

export interface ExtractedEntityItem {
  entity: string;
  category: string;
  relevance?: string;
  salienceScore?: number;
  salienceLevel?: "central" | "supporting" | "peripheral";
  selected: boolean;
  shortDefinition?: string;
  canonicalName?: string;
  disambiguationContext?: string;
  ontologyUri?: string;
  confidenceScore?: number;
}

export interface JointExtractedData {
  entities: ExtractedEntityItem[];
  triplets: SemanticTriplet[];
  suggestedRelationships: SuggestedRelationship[];
  summary: string;
  detectedClusters: string[];
  topicalThemes?: string[];
  isLocalFallback?: boolean;
}

export interface MissingEntityGap {
  id: string;
  entity: string;
  category: string;
  importance: "crítica" | "alta" | "média";
  reason: string;
  suggestedParentCluster: string;
  estimatedSearchIntent: string;
}

export interface MissingEdgeGap {
  id: string;
  sourceEntity: string;
  targetEntity: string;
  suggestedPredicate: string;
  relationshipType: RelationshipType;
  priority: "alta" | "média" | "baixa";
  reasoning: string;
  schemaProperty?: string;
}

export interface TopicalAuditReport {
  analyzedTopic: string;
  topicalAuthorityScore: number; // 0 to 100
  graphDensityScore: number; // 0 to 100
  totalEntitiesCount: number;
  totalConnectionsCount: number;
  missingEntities: MissingEntityGap[];
  missingEdges: MissingEdgeGap[];
  orphanedEntities: string[];
  strategicRecommendations: string[];
  pillarEntities: string[];
  modelUsed?: string;
  isLocalFallback?: boolean;
}

export interface InternalLinkSuggestion {
  id: string;
  sourceText?: string;
  targetEntity: string;
  targetEntityId?: string;
  anchorText: string;
  targetUrl: string;
  contextSentence: string;
  relevanceScore: number;
  reasoning: string;
  occurrenceIndex?: number;
  type: "exact" | "synonym" | "semantic";
}

export interface InternalLinkingReport {
  textAnalyzed: string;
  htmlWithLinks: string;
  markdownWithLinks: string;
  totalLinksInserted: number;
  suggestions: InternalLinkSuggestion[];
  topicGaps: {
    term: string;
    occurrences: number;
    suggestedCategory: string;
    potentialReason: string;
  }[];
  interlinkingMatrix?: {
    sourceEntity: string;
    linksTo: { targetEntity: string; anchorText: string }[];
  }[];
}

export interface PromptPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  template: string;
}

export type GenerationModel =
  | "gemini-3.8-flash"
  | "gemini-3.7-flash"
  | "gemini-3.1-flash-lite";

export interface GenerationSettings {
  model: GenerationModel;
  tone: string;
  length: "concise" | "standard" | "detailed";
  language: string;
  enableGrounding: boolean;
  customPromptTemplate: string;
}

export type UserRole = "admin" | "client";
export type UserStatus = "active" | "pending" | "blocked" | "expired";
export type UserPlan = "trial" | "monthly" | "annual" | "lifetime";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  plan: UserPlan;
  createdAt: string;
  lastLoginAt?: string;
  notes?: string;
  toolUsageCount: number;
}

export type AuthRole = "admin" | "beta_tester";

export interface AuthPermissions {
  unlimited: boolean;
  quotaRemaining?: number;
  editPrompts: boolean;
  fullExport: boolean;
  wikidataReconcile: boolean;
  graphMining: boolean;
}

export interface AuthSession {
  isAuthenticated: boolean;
  role: AuthRole;
  name: string;
  passcodeUsed: string;
  loginAt: string;
  permissions: AuthPermissions;
}



