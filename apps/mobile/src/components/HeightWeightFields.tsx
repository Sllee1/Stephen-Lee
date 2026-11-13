import React, { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { cmToFtIn, ftInToCm, kgToLb, lbToKg, type UnitPref } from "@nutrition-app/shared";
import { colors } from "../theme";

interface Props {
  initialUnitPref: UnitPref;
  initialHeightCm: number | null;
  initialWeightKg: number | null;
  onChange: (values: { unitPref: UnitPref; heightCm: number | null; weightKg: number | null }) => void;
}

/**
 * Height/weight entry that supports both unit systems — cm/kg or ft+in/lb —
 * switchable at any time, converting whatever's already typed across rather
 * than clearing it. heightCm/weightKg (the only units the backend stores,
 * see prisma/schema.prisma) are always what's reported via onChange,
 * regardless of which system is currently displayed; conversion uses the
 * shared helpers in packages/shared/src/calc/units.ts.
 */
export function HeightWeightFields({ initialUnitPref, initialHeightCm, initialWeightKg, onChange }: Props) {
  const [unitPref, setUnitPref] = useState<UnitPref>(initialUnitPref);

  const initialFtIn = initialHeightCm != null ? cmToFtIn(initialHeightCm) : null;
  const [cm, setCm] = useState(initialUnitPref === "metric" && initialHeightCm != null ? String(initialHeightCm) : "");
  const [ft, setFt] = useState(initialFtIn ? String(initialFtIn.ft) : "");
  const [inch, setInch] = useState(initialFtIn ? String(initialFtIn.inch) : "");
  const [kg, setKg] = useState(initialUnitPref === "metric" && initialWeightKg != null ? String(initialWeightKg) : "");
  const [lb, setLb] = useState(initialUnitPref === "imperial" && initialWeightKg != null ? String(Math.round(kgToLb(initialWeightKg))) : "");

  function emit(next: Partial<{ unitPref: UnitPref; cm: string; ft: string; inch: string; kg: string; lb: string }>) {
    const merged = { unitPref, cm, ft, inch, kg, lb, ...next };
    const heightCm =
      merged.unitPref === "metric"
        ? Number(merged.cm) || null
        : merged.ft || merged.inch
          ? ftInToCm(Number(merged.ft) || 0, Number(merged.inch) || 0)
          : null;
    const weightKg = merged.unitPref === "metric" ? Number(merged.kg) || null : merged.lb ? lbToKg(Number(merged.lb)) : null;
    onChange({ unitPref: merged.unitPref, heightCm, weightKg });
  }

  // Report the seeded values once on mount, so a parent that saves
  // immediately (without the user touching anything) still gets the
  // pre-filled numbers instead of stale initial state.
  useEffect(() => {
    emit({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchUnit(next: UnitPref) {
    if (next === unitPref) return;
    // Convert whatever's already entered across, so switching units doesn't
    // throw away what the user just typed.
    let nextFt = ft;
    let nextInch = inch;
    let nextCm = cm;
    let nextLb = lb;
    let nextKg = kg;
    if (next === "imperial" && cm) {
      const { ft: f, inch: i } = cmToFtIn(Number(cm));
      nextFt = String(f);
      nextInch = String(i);
    }
    if (next === "imperial" && kg) {
      nextLb = String(Math.round(kgToLb(Number(kg))));
    }
    if (next === "metric" && (ft || inch)) {
      nextCm = String(Math.round(ftInToCm(Number(ft) || 0, Number(inch) || 0)));
    }
    if (next === "metric" && lb) {
      nextKg = String(Math.round(lbToKg(Number(lb))));
    }
    setFt(nextFt);
    setInch(nextInch);
    setCm(nextCm);
    setLb(nextLb);
    setKg(nextKg);
    setUnitPref(next);
    emit({ unitPref: next, cm: nextCm, ft: nextFt, inch: nextInch, kg: nextKg, lb: nextLb });
  }

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <UnitChip label="Metric (cm / kg)" active={unitPref === "metric"} onPress={() => switchUnit("metric")} />
        <UnitChip label="Imperial (ft/in, lb)" active={unitPref === "imperial"} onPress={() => switchUnit("imperial")} />
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "700", color: colors.ink }}>Height</Text>
        {unitPref === "metric" ? (
          <TextInput
            keyboardType="decimal-pad"
            value={cm}
            onChangeText={(v) => {
              setCm(v);
              emit({ cm: v });
            }}
            style={inputStyle}
            placeholder="e.g. 170 cm"
          />
        ) : (
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              keyboardType="number-pad"
              value={ft}
              onChangeText={(v) => {
                setFt(v);
                emit({ ft: v });
              }}
              style={[inputStyle, { flex: 1 }]}
              placeholder="ft"
            />
            <TextInput
              keyboardType="number-pad"
              value={inch}
              onChangeText={(v) => {
                setInch(v);
                emit({ inch: v });
              }}
              style={[inputStyle, { flex: 1 }]}
              placeholder="in"
            />
          </View>
        )}
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "700", color: colors.ink }}>Weight</Text>
        {unitPref === "metric" ? (
          <TextInput
            keyboardType="decimal-pad"
            value={kg}
            onChangeText={(v) => {
              setKg(v);
              emit({ kg: v });
            }}
            style={inputStyle}
            placeholder="e.g. 68 kg"
          />
        ) : (
          <TextInput
            keyboardType="decimal-pad"
            value={lb}
            onChangeText={(v) => {
              setLb(v);
              emit({ lb: v });
            }}
            style={inputStyle}
            placeholder="e.g. 150 lb"
          />
        )}
      </View>
    </View>
  );
}

function UnitChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: active ? colors.ink : colors.card,
      }}
    >
      <Text style={{ color: active ? colors.paper : colors.ink, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: colors.line,
  borderRadius: 10,
  padding: 14,
  backgroundColor: colors.card,
};
