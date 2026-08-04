"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { dataRoomApi } from "@/lib/api/modules/dataroom.api";
import { DataRoomDocument } from "../types";
import toast from "react-hot-toast";

interface FixMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DataRoomDocument;
  onSuccess: () => void;
}

export function FixMappingModal({ isOpen, onClose, document, onSuccess }: FixMappingModalProps) {
  // Mapping of System Field -> Column Header
  const [mapping, setMapping] = useState<Record<string, string>>({});
  // If a field is set to manual override, we track it here
  const [manualFields, setManualFields] = useState<Record<string, string>>({});
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize mapping from document's existing columnMapping
  useEffect(() => {
    if (document && document.columnMapping) {
      const initialMap: Record<string, string> = {};
      const initialManuals: Record<string, string> = {};
      
      Object.entries(document.columnMapping).forEach(([key, val]) => {
        initialMap[key] = val || "";
      });
      
      setMapping(initialMap);
      setManualFields(initialManuals);
    }
  }, [document]);

  // Dropdown options derived from resolved mapping and matching keys.
  // PRAGMATIC FRONTEND WORKAROUND:
  // Since we do not have a dedicated backend endpoint to retrieve the raw unparsed headers list
  // from the file itself, we populate options with:
  // 1. The currently matched values inside column_mapping.
  // 2. Fallback option "Type column name manually" to let the admin override.
  const getDropdownOptions = (currentVal: string) => {
    const optionsSet = new Set<string>();
    
    // Add current value
    if (currentVal) optionsSet.add(currentVal);
    
    // Add all matched columns from the existing document response
    if (document && document.columnMapping) {
      Object.values(document.columnMapping).forEach((v) => {
        if (v) optionsSet.add(v);
      });
    }

    return Array.from(optionsSet);
  };

  const handleDropdownChange = (sysField: string, value: string) => {
    setMapping((prev) => ({
      ...prev,
      [sysField]: value,
    }));
  };

  const handleManualTextChange = (sysField: string, value: string) => {
    setManualFields((prev) => ({
      ...prev,
      [sysField]: value,
    }));
  };

  const handleSaveAndReprocess = async () => {
    setIsSaving(true);
    try {
      // Build final mapping payload resolving manual inputs
      const finalMapping: Record<string, string | null> = {};
      Object.entries(mapping).forEach(([key, val]) => {
        if (val === "__MANUAL__") {
          finalMapping[key] = manualFields[key]?.trim() || null;
        } else {
          finalMapping[key] = val || null;
        }
      });

      // 1. Update document's column mapping
      await dataRoomApi.updateColumnMapping(document.uid, {
        columnMapping: finalMapping,
      });

      // 2. Optionally save mapping template
      if (saveTemplate) {
        // Retrieve dataset detail first to extract category and sourceSystem if available
        try {
          const dataset = await dataRoomApi.getDatasetDetail(document.datasetUid);
          const activeMapping: Record<string, string> = {};
          
          Object.entries(finalMapping).forEach(([k, v]) => {
            if (v) activeMapping[k] = v;
          });

          await dataRoomApi.saveMappingTemplate({
            category: dataset.category,
            sourceSystem: dataset.sourceSystem || "Manual Upload",
            mapping: activeMapping,
          });
          toast.success("Mapping template saved successfully.");
        } catch (templateErr) {
          // Non-blocking log, allow retry flow to continue
          console.error("Failed to save mapping template:", templateErr);
        }
      }

      // 3. Trigger immediate document re-processing
      await dataRoomApi.retryDocument(document.uid);
      
      toast.success("Column mappings saved! Re-processing initiated.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save column mapping and retry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Fix Column Mapping - ${document.originalFilename}`} size="2xl">
      <div className="flex flex-col gap-5 text-gray-800">
        <p className="text-xs font-semibold text-gray-500 leading-relaxed">
          The system could not automatically map all columns in this file. Review the mapping below and correct any mismatches, then re-process.
        </p>

        {/* Mappings Table */}
        <div className="border border-gray-200/80 rounded-2xl overflow-hidden bg-white shadow-sm shrink-0">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left font-bold text-gray-500 uppercase tracking-wider">System Field</th>
                <th className="px-4 py-2.5 text-left font-bold text-gray-500 uppercase tracking-wider">File Column Match</th>
                <th className="px-4 py-2.5 text-left font-bold text-gray-500 uppercase tracking-wider w-20">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold">
              {Object.keys(mapping).map((sysField) => {
                const currentVal = mapping[sysField];
                const isMapped = currentVal && currentVal !== "__MANUAL__";
                const isManualSelected = currentVal === "__MANUAL__";
                const options = getDropdownOptions(currentVal);

                const selectOptions = [
                  { value: "", label: "-- Choose Header --" },
                  ...options.map((opt) => ({ value: opt, label: opt })),
                  { value: "__MANUAL__", label: "Type column name manually..." },
                ];

                return (
                  <tr key={sysField}>
                    <td className="px-4 py-3 text-gray-700 font-bold max-w-[120px] truncate">{sysField}</td>
                    <td className="px-4 py-3 flex flex-col gap-1.5">
                      <Select
                        placeholder="-- Choose Header --"
                        options={selectOptions}
                        value={currentVal}
                        onChange={(val) => handleDropdownChange(sysField, val)}
                      />

                      {isManualSelected && (
                        <input
                          type="text"
                          required
                          placeholder="Type headers manually..."
                          value={manualFields[sysField] || ""}
                          onChange={(e) => handleManualTextChange(sysField, e.target.value)}
                          className="w-full px-3.5 py-1.5 bg-white border border-gray-250 rounded-full text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isMapped || (isManualSelected && manualFields[sysField]?.trim()) ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Mapped
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Not Found
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Save Template checkbox */}
        <div className="flex items-center gap-2 px-1 select-none shrink-0">
          <input
            type="checkbox"
            id="saveTemplate"
            checked={saveTemplate}
            onChange={(e) => setSaveTemplate(e.target.checked)}
            className="w-4 h-4 text-primary bg-gray-100 border-gray-250 rounded focus:ring-primary/20 cursor-pointer"
          />
          <label htmlFor="saveTemplate" className="text-xs font-bold text-gray-500 cursor-pointer">
            Save this mapping as a template for future uploads of this category
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 shrink-0">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleSaveAndReprocess} loading={isSaving}>
            Save & Re-process
          </Button>
        </div>
      </div>
    </Modal>
  );
}
