import { memo, useMemo } from "react";
import { Castle, Church, Drama, Home, Landmark } from "lucide-react";
import context from "../data/vienna-context.json";
import { vienna } from "../geography";
import { places } from "../viennaPlaces";
import {
  projectedGeometryPath,
  nearestMapPlace,
  screenPoint,
  placeMapLabels,
} from "../viennaMap";
import { trip } from "../content";

const icons = {
  belvedere: Castle,
  staatsoper: Drama,
  hofburg: Landmark,
  stephansdom: Church,
  karlskirche: Church,
};

export const ViennaContext = memo(function ViennaContext({
  projection,
  roads = true,
}) {
  const paths = useMemo(() => {
    const layers = { blocks: [], green: [], water: [], streets: [], major: [] };
    for (const feature of context.features)
      layers[feature.properties.layer].push(
        projectedGeometryPath(feature.geometry, projection),
      );
    if (roads)
      for (const f of vienna.features)
        layers[f.properties.class === "major" ? "major" : "streets"].push(
          projectedGeometryPath(f.geometry, projection),
        );
    return Object.fromEntries(
      Object.entries(layers).map(([key, values]) => [key, values.join("")]),
    );
  }, [projection, roads]);
  const outlines = useMemo(
    () =>
      places
        .filter((p) => p.outline)
        .map((p) => ({
          id: p.id,
          d: projectedGeometryPath(p.outline, projection),
        })),
    [projection],
  );
  return (
    <g
      className="vienna-context"
      data-source="Stadt Wien / OpenStreetMap"
      data-testid="vienna-context"
    >
      <path className="v-city-blocks" d={paths.blocks} fillRule="evenodd" />
      <path className="v-city-green" d={paths.green} fillRule="evenodd" />
      <path className="v-city-water" d={paths.water} fillRule="evenodd" />
      {roads && (
        <>
          <path className="v-street-case" d={paths.streets} />
          <path className="v-streets" d={paths.streets} />
          <path className="v-major-case" d={paths.major} />
          <path className="v-major" d={paths.major} />
        </>
      )}
      <g className="v-landmark-areas">
        {outlines.map((p) => (
          <path
            key={p.id}
            data-landmark-area={p.id}
            d={p.d}
            fillRule="evenodd"
          />
        ))}
      </g>
    </g>
  );
});

export function ViennaMarkers({
  projection,
  view = { k: 1, x: 0, y: 0 },
  width,
  height,
  selected,
  hover,
  onSelect,
  onHover,
  interactive = true,
  compact = false,
  opacity = 1,
  showHome = true,
}) {
  const point = (coordinates) => screenPoint(projection(coordinates), view);
  const home = point(trip.airbnb.coordinates);
  const visible = places
    .map((p) => ({ ...p, point: point(p.coordinates) }))
    .filter(
      (p) =>
        p.point[0] > 18 &&
        p.point[0] < width - 18 &&
        p.point[1] > 18 &&
        p.point[1] < height - 18,
    );
  const labelPoints = [
    ...(showHome &&
    home[0] > 0 &&
    home[0] < width &&
    home[1] > 0 &&
    home[1] < height
      ? [{ id: "home", name: "Nuestro ático", point: home, home: true }]
      : []),
    ...visible.filter((p) => p.id === selected || p.id === hover),
    ...visible.filter((p) => p.featured && p.id !== selected && p.id !== hover),
  ];
  const reserved = compact
    ? [
        { x: width - 205, y: height - 79, width: 205, height: 79 },
        { x: 0, y: height - 48, width: 135, height: 48 },
      ]
    : [
        { x: width - 60, y: 8, width: 60, height: 156 },
        { x: 0, y: height - 38, width: 200, height: 38 },
      ];
  if (!showHome)
    reserved.push({
      x: home[0] - 65,
      y: home[1] - 65,
      width: 130,
      height: 125,
    });
  const labels = placeMapLabels(
    labelPoints.map((p) => ({ ...p, name: p.shortName || p.name })),
    width,
    height,
    reserved,
  );
  const pointerPlace = (event, fallback) => {
    const rect = event.currentTarget.ownerSVGElement.getBoundingClientRect();
    return (
      nearestMapPlace(
        visible,
        projection,
        view,
        [event.clientX - rect.left, event.clientY - rect.top],
        26,
      )?.id || fallback
    );
  };
  return (
    <g
      className={"v-marker-layer" + (compact ? " v-compact-markers" : "")}
      opacity={opacity}
      aria-hidden={!interactive}
    >
      {visible
        .sort((a, b) => Number(a.featured) - Number(b.featured))
        .map((p) => {
          const Icon = icons[p.id];
          const active = selected === p.id;
          const r = active ? 19 : p.featured ? (compact ? 12 : 16) : 4;
          return (
            <g
              key={p.id}
              className={`v-place-pin ${p.featured ? "v-featured-pin" : ""} ${active ? "v-selected-pin" : ""}`}
              transform={`translate(${p.point})`}
              data-vienna-marker={p.id}
              data-longitude={p.coordinates[0]}
              data-latitude={p.coordinates[1]}
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : -1}
              aria-label={"Ver " + p.name}
              aria-pressed={active}
              onClick={(event) => {
                event.stopPropagation();
                if (interactive)
                  onSelect(
                    event.detail > 0 ? pointerPlace(event, p.id) : p.id,
                    event.currentTarget,
                    event,
                  );
              }}
              onKeyDown={(event) => {
                if (
                  interactive &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  event.stopPropagation();
                  onSelect(p.id, event.currentTarget, event);
                }
              }}
              onMouseEnter={() => onHover?.(p.id)}
              onMouseMove={(event) => onHover?.(pointerPlace(event, p.id))}
              onMouseLeave={() => onHover?.(null)}
              onFocus={() => onHover?.(p.id)}
              onBlur={() => onHover?.(null)}
            >
              <title>{p.name}</title>
              <circle
                className="v-pin-hit"
                r={p.featured || active ? 23 : 14}
              />
              {active && <circle className="v-selected-halo" r="29" />}
              <circle className="v-pin-disc" r={r} />
              {(p.featured || active) &&
                (Icon ? (
                  <g transform="translate(-8 -8)" pointerEvents="none">
                    <Icon size={16} strokeWidth={1.55} />
                  </g>
                ) : (
                  <circle className="v-selected-core" r="5" />
                ))}
            </g>
          );
        })}
      {labels
        .filter((p) => p.rect)
        .map((p) => (
          <g
            key={p.id}
            className={"v-pin-label" + (p.home ? " v-home-label" : "")}
            pointerEvents="none"
            data-vienna-label={p.id}
          >
            <rect
              x={p.rect.x}
              y={p.rect.y}
              width={p.rect.width}
              height={p.rect.height}
              rx="7"
            />
            <text
              x={p.rect.x + p.rect.width / 2}
              y={p.rect.y + p.rect.height / 2 + 4}
              textAnchor="middle"
            >
              {p.name}
            </text>
          </g>
        ))}
      {showHome && (
        <g
          className="v-home-pin"
          transform={`translate(${home})`}
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : -1}
          aria-label="Nuestro ático, punto de partida"
          onClick={(event) => {
            event.stopPropagation();
            if (interactive) onSelect(null, event.currentTarget);
          }}
          onKeyDown={(event) => {
            if (interactive && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              onSelect(null, event.currentTarget);
            }
          }}
          data-testid="explorer-home-pin"
          data-longitude={trip.airbnb.coordinates[0]}
          data-latitude={trip.airbnb.coordinates[1]}
        >
          <circle className="v-home-halo" r="30" />
          <circle className="v-home-disc" r="21" />
          <g transform="translate(-9 -9)" pointerEvents="none">
            <Home size={18} strokeWidth={1.7} />
          </g>
        </g>
      )}
    </g>
  );
}
