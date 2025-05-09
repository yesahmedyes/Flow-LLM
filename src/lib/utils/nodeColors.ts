import colors from "tailwindcss/colors";

export const nodeColorPalette = {
  light: [
    colors.pink[500],
    colors.blue[500],
    colors.emerald[500],
    colors.amber[500],
    colors.indigo[500],
    colors.orange[500],
    colors.teal[500],
    colors.purple[500],
    colors.cyan[500],
    colors.lime[500],
    colors.rose[500],
    colors.violet[500],
    colors.green[500],
    colors.red[500],
  ],
  dark: [
    colors.pink[400],
    colors.blue[400],
    colors.emerald[400],
    colors.amber[400],
    colors.indigo[400],
    colors.orange[400],
    colors.teal[400],
    colors.purple[400],
    colors.cyan[400],
    colors.lime[400],
    colors.rose[400],
    colors.violet[400],
    colors.green[400],
    colors.red[400],
  ],
};

export function createLabelColorMap(labels: string[]) {
  const result = new Map<string, number>();

  result.set("Entity", 0);

  const sortedLabels = labels.filter((label) => label !== "Entity").sort((a, b) => a.localeCompare(b));

  let nextIndex = 1;

  sortedLabels.forEach((label) => {
    if (!result.has(label)) {
      result.set(label, nextIndex % nodeColorPalette.light.length);
      nextIndex++;
    }
  });

  return result;
}

export function getNodeColor(
  label: string | null | undefined,
  isDarkMode: boolean,
  labelColorMap: Map<string, number>,
): string {
  if (!label) {
    return isDarkMode ? nodeColorPalette.dark[0]! : nodeColorPalette.light[0]!;
  }

  if (label === "Entity" || !labelColorMap.has(label)) {
    return isDarkMode ? nodeColorPalette.dark[0]! : nodeColorPalette.light[0]!;
  }

  const colorIndex = labelColorMap.get(label) ?? 0;

  return isDarkMode ? nodeColorPalette.dark[colorIndex]! : nodeColorPalette.light[colorIndex]!;
}
