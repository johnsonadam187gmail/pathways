// MAML Enum Type Definitions
// All enum types used across the MAML entity schema

export enum RelativeRole {
  OFFENSIVE = "OFFENSIVE",
  DEFENSIVE = "DEFENSIVE",
  NEUTRAL = "NEUTRAL",
  SYMMETRICAL_DANGER = "SYMMETRICAL_DANGER",
}

export enum Sidedness {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  AMBIDEXTROUS = "AMBIDEXTROUS",
}

export enum ActionType {
  SWEEP = "SWEEP",
  SUBMISSION = "SUBMISSION",
  ESCAPE = "ESCAPE",
  GUARD_PASS = "GUARD_PASS",
  POSTURE_ADJUST = "POSTURE_ADJUST",
}

export enum GatewayType {
  INTENT_DRIVEN = "INTENT_DRIVEN",
  STIMULUS_DRIVEN = "STIMULUS_DRIVEN",
}

export enum SinkType {
  SUBMISSION_SUCCESS = "SUBMISSION_SUCCESS",
  SUBMISSION_CONCEDED = "SUBMISSION_CONCEDED",
}
