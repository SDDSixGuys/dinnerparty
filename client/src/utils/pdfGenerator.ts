import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions } from "pdfmake/interfaces";

// Type-safe VFS assignment to satisfy linter and prevent WSoD
const vfs = (pdfFonts as unknown as { pdfMake: { vfs: Record<string, string> } }).pdfMake
  ? (pdfFonts as unknown as { pdfMake: { vfs: Record<string, string> } }).pdfMake.vfs
  : (pdfFonts as unknown as { vfs: Record<string, string> }).vfs;

(pdfMake as any).vfs = vfs; // Internal pdfMake requirement

interface PdfIngredient {
  name: string;
  quantity?: number;
  unit?: string;
  notes?: string;
}

interface PdfInstruction {
  stepNumber: number;
  text: string;
}

interface PdfRecipe {
  title: string;
  description?: string;
  totalTimeMinutes?: number;
  servings?: number;
  difficulty?: string;
  ingredients?: PdfIngredient[];
  instructions?: PdfInstruction[];
}

export const downloadRecipeAsPDF = (recipe: PdfRecipe) => {
  const docDefinition: TDocumentDefinitions = {
    content: [
      { text: recipe.title, style: "header" },
      { text: recipe.description || "", style: "description" },
      {
        columns: [
          recipe.totalTimeMinutes ? `Total Time: ${recipe.totalTimeMinutes} mins` : "",
          recipe.servings ? `Yield: ${recipe.servings} servings` : "",
          recipe.difficulty ? `Difficulty: ${recipe.difficulty}` : "",
        ],
        style: "metadata",
      },
      { text: "Ingredients", style: "sectionHeader" },
      {
        ul: recipe.ingredients?.map((i) => {
          const qty = i.quantity || "";
          const unit = i.unit || "";
          const notes = i.notes ? ` (${i.notes})` : "";
          return `${qty} ${unit} ${i.name}${notes}`.trim();
        }) || ["No ingredients listed."],
        style: "list",
      },
      { text: "Instructions", style: "sectionHeader" },
      {
        ol: recipe.instructions
          ?.slice()
          .sort((a, b) => a.stepNumber - b.stepNumber)
          .map((step) => step.text) || ["No instructions listed."],
        style: "list",
      },
    ],
    styles: {
      header: { fontSize: 24, bold: true, margin: [0, 0, 0, 8] },
      description: { fontSize: 12, italics: true, margin: [0, 0, 0, 15] },
      metadata: { fontSize: 10, margin: [0, 0, 0, 20], color: "#555555" },
      sectionHeader: { fontSize: 16, bold: true, margin: [0, 15, 0, 10] },
      list: { margin: [0, 0, 0, 15], lineHeight: 1.3 },
    },
    defaultStyle: { font: "Roboto" },
  };

  pdfMake.createPdf(docDefinition).download(`${recipe.title.replace(/\s+/g, "_")}.pdf`);
};