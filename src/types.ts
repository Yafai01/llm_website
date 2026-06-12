/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TokenUnit {
  id: number;
  text: string;
  color: string;
  bytes: string;
}

export interface VectorNode {
  name: string;
  x: number; // custom sentiment/dimension 1
  y: number; // custom relation/dimension 2
  category: "Royalty" | "Gender" | "Time" | "Tech" | "Animal";
}

export interface AttentionRelation {
  fromWord: string;
  toWord: string;
  weight: number;
}
