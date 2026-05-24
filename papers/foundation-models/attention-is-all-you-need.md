---
title: "Attention Is All You Need"
shortTitle: "Transformer"
year: 2017
date: 2026-05-25
category: "foundation-models"
tags: ["transformer", "attention", "sequence-modeling"]
authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar"]
paper: "https://arxiv.org/abs/1706.03762"
summary: "Introduces the Transformer architecture, replacing recurrence with self-attention for efficient sequence modeling."
status: "read"
rating: 5
---

# Attention Is All You Need

## One-Sentence Summary

The paper shows that self-attention can replace recurrence and convolution as the main mechanism for sequence transduction.

## Problem And Motivation

Recurrent models process tokens sequentially, which limits parallelism and makes long-range dependencies harder to optimize.

## Core Method

The Transformer stacks multi-head self-attention and feed-forward blocks. Scaled dot-product attention is:

$$
\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

## Experiments

The model improves machine translation quality while training faster than recurrent baselines.

## Limitations

The original work focuses on supervised translation and does not directly address long-context memory or pretraining scale.

## Personal Notes

This is the architectural base for most modern LLMs, so it is useful as a reference note for later papers.
