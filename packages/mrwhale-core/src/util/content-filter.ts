import * as profanity from "profanity-util";

// Configuration constants
export const CONTENT_FILTER_CONFIG = {
  MAX_TEXT_LENGTH: 1000,
  MIN_TEXT_LENGTH: 1,
  MAX_WORD_LENGTH: 50,
  REPEATED_PATTERN_THRESHOLD: 4, // How many times a pattern can repeat
} as const;

// Forbidden patterns (case-insensitive)
export const FORBIDDEN_PATTERNS = [
  // Violence & Harm
  /\b(kill|murder|suicide|harm|hurt|violence|death|die|stab|shoot|attack|torture|abuse)\b/gi,

  // Hate Speech & Discrimination
  /\b(hate|racist|sexist|nazi|fascist|bigot|homophobic|transphobic)\b/gi,

  // Sexual Violence & Harassment
  /\b(rape|assault|molest|harassment|stalking|grooming|predator)\b/gi,

  // Drugs & Substances
  /\b(drug|drugs|cocaine|heroin|meth|weed|marijuana|pills)\b/gi,

  // Self-Harm
  /\b(self harm|cutting)\b/gi,
] as const;

// Safe fallback responses for different contexts
export const SAFETY_RESPONSES = {
  general: [
    "I can't help with that content. Please try something more appropriate.",
    "That content isn't suitable for this chat. Let's keep things friendly.",
    "I'd prefer to help with family-friendly content. Try something else?",
    "Let's stick to appropriate topics, shall we?",
  ],
  choices: [
    "I can't help choose between those options. Please provide appropriate choices.",
    "Those choices aren't suitable for me to decide on. Try some different options.",
    "I'd prefer not to choose between those. How about some other options?",
    "Let's stick to family-friendly choices, shall we?",
  ],
  definitions: [
    "I found a definition, but it's not appropriate for this chat.",
    "That word has definitions that aren't suitable for all audiences.",
    "The available definitions for that word aren't family-friendly.",
    "I'd rather not share the definitions I found for that word.",
  ],
} as const;

/**
 * Content validation result interface
 */
export interface ContentValidationResult {
  isValid: boolean;
  reason?: string;
  category?: string;
  cleanedContent?: string;
}

/**
 * Content filter options
 */
export interface ContentFilterOptions {
  checkProfanity?: boolean;
  checkForbiddenPatterns?: boolean;
  checkUrls?: boolean;
  checkLength?: boolean;
  maxLength?: number;
  minLength?: number;
  allowedUrlDomains?: string[];
}

/**
 * Default content filter options
 */
const DEFAULT_OPTIONS: Required<ContentFilterOptions> = {
  checkProfanity: true,
  checkForbiddenPatterns: true,
  checkUrls: true,
  checkLength: true,
  maxLength: CONTENT_FILTER_CONFIG.MAX_TEXT_LENGTH,
  minLength: CONTENT_FILTER_CONFIG.MIN_TEXT_LENGTH,
  allowedUrlDomains: [],
};

/**
 * Checks if text contains inappropriate content using multiple validation methods.
 *
 * @param text The text to validate
 * @param options Optional configuration for validation checks
 * @returns ContentValidationResult with validation status and details
 */
export function validateContent(
  text: string,
  options: ContentFilterOptions = {},
): ContentValidationResult {
  if (!text || typeof text !== "string") {
    return { isValid: false, reason: "Invalid input", category: "input" };
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const cleanText = text.trim();

  // Length validation
  if (opts.checkLength) {
    if (cleanText.length < opts.minLength) {
      return {
        isValid: false,
        reason: "Content too short",
        category: "length",
      };
    }
    if (cleanText.length > opts.maxLength) {
      return {
        isValid: false,
        reason: "Content too long",
        category: "length",
      };
    }
  }

  // Profanity check
  if (opts.checkProfanity) {
    try {
      const profanityWords = profanity.check(cleanText);
      if (profanityWords.length > 0) {
        return {
          isValid: false,
          reason: "Contains profanity",
          category: "profanity",
        };
      }
    } catch (error) {
      // Continue if profanity check fails
    }
  }

  // Forbidden patterns check
  if (opts.checkForbiddenPatterns) {
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(cleanText)) {
        return {
          isValid: false,
          reason: "Contains forbidden content",
          category: "forbidden",
        };
      }
    }
  }

  // URL validation
  if (opts.checkUrls) {
    const urlPattern = /https?:\/\/|www\.|\.(com|net|org|io|edu|gov|mil)/i;
    if (urlPattern.test(cleanText)) {
      // Check if URL is from allowed domains
      if (opts.allowedUrlDomains.length === 0) {
        return {
          isValid: false,
          reason: "URLs not allowed",
          category: "url",
        };
      }

      const isAllowedDomain = opts.allowedUrlDomains.some((domain) =>
        cleanText.toLowerCase().includes(domain.toLowerCase()),
      );

      if (!isAllowedDomain) {
        return {
          isValid: false,
          reason: "URL from disallowed domain",
          category: "url",
        };
      }
    }
  }

  return {
    isValid: true,
    cleanedContent: cleanText,
  };
}

/**
 * Quick check for inappropriate content using basic validation.
 *
 * @param text The text to check
 * @returns true if content is inappropriate, false if safe
 */
export function isInappropriate(text: string): boolean {
  const result = validateContent(text);
  return !result.isValid;
}

/**
 * Gets a random safety response based on context.
 *
 * @param context The context for the safety response (general, choices, definitions)
 * @returns A random safety response
 */
export function getRandomSafetyResponse(
  context: keyof typeof SAFETY_RESPONSES = "general",
): string {
  const responses = SAFETY_RESPONSES[context];
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Validates an array of choices/options for commands like choose.
 *
 * @param choices Array of choice strings
 * @param maxChoices Maximum allowed number of choices
 * @param maxChoiceLength Maximum length per choice
 * @returns Object with validation result and cleaned choices
 */
export function validateChoices(
  choices: string[],
  maxChoices: number = 20,
  maxChoiceLength: number = 100,
): {
  valid: boolean;
  choices?: string[];
  message?: string;
} {
  const cleanChoices: string[] = [];

  for (let choice of choices) {
    choice = choice.trim();

    if (choice.length === 0) continue;

    if (choice.length > maxChoiceLength) {
      return {
        valid: false,
        message: `One of your choices is too long. Please keep choices under ${maxChoiceLength} characters.`,
      };
    }

    const validation = validateContent(choice);
    if (!validation.isValid) {
      return {
        valid: false,
        message: getRandomSafetyResponse("choices"),
      };
    }

    cleanChoices.push(choice);
  }

  if (cleanChoices.length === 0) {
    return {
      valid: false,
      message: "No valid choices provided.",
    };
  }

  if (cleanChoices.length > maxChoices) {
    return {
      valid: false,
      message: `Too many choices! Please limit to ${maxChoices} options.`,
    };
  }

  // Remove duplicates (case-insensitive)
  const uniqueChoices = cleanChoices.filter(
    (choice, index, arr) =>
      arr.findIndex((c) => c.toLowerCase() === choice.toLowerCase()) === index,
  );

  return {
    valid: true,
    choices: uniqueChoices,
  };
}
