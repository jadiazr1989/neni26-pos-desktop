// src/modules/catalog/products/ui/ui/ProductDialog.tsx
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { ProductDTO } from "@/lib/modules/catalog/products/product.dto";
import { productService } from "@/lib/modules/catalog/products/product.service";

import { AsyncComboboxSingle } from "@/components/shared/AsyncComboboxSingle";
import { useBrandOptions } from "../hooks/useBrandOptions";
import { useCategoryOptions } from "../hooks/useCategoryOptions";

export function ProductDialog(props: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial?: ProductDTO | null;
    onSaved: (productId: string) => Promise<void> | void;
}) {
    const mode = props.initial ? "edit" : "create";

    const [name, setName] = React.useState("");
    const [barcode, setBarcode] = React.useState("");
    const [description, setDescription] = React.useState("");

    const [brandId, setBrandId] = React.useState<string | null>(null);
    const [categoryId, setCategoryId] = React.useState<string | null>(null);
    const [formError, setFormError] = React.useState<string | null>(null);

    const [submitting, setSubmitting] = React.useState(false);

    const brands = useBrandOptions({ take: 50 });
    const categories = useCategoryOptions({ take: 50 });

    React.useEffect(() => {
        if (!props.open) return;
        const p = props.initial;
        setName(p?.name ?? "");
        setBarcode(p?.barcode ?? "");
        setDescription(p?.description ?? "");
        setFormError(null);

        setBrandId(p?.brandId ?? null);
        setCategoryId(p?.categoryId ?? null);
    }, [props.open, props.initial]);

    async function submit() {
        setSubmitting(true);
        setFormError(null);
        try {
            const nameNorm = name.trim();
            if (!nameNorm) {
                setFormError("Nombre requerido.");
                return;
            }
            if (!categoryId) {
                setFormError("Categoría requerida.");
                return;
            }

            if (mode === "create") {
                const id = await productService.create({
                    name: nameNorm,
                    barcode: barcode.trim() || null,
                    description: description.trim() || null,
                    brandId,
                    categoryId, // ✅ obligatorio
                });
                await props.onSaved(id);
            } else {
                const id = props.initial!.id;
                await productService.update(id, {
                    name: nameNorm,
                    barcode: barcode.trim() || null,
                    description: description.trim() || null,
                    brandId,
                    categoryId, // ✅ obligatorio
                });
                await props.onSaved(id);
            }
        } catch (e) {
            setFormError(e instanceof Error ? e.message : "No se pudo guardar el producto.");
        } finally {
            setSubmitting(false);
        }
    }


    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Nuevo producto" : "Editar producto"}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-3">
                    {formError && <div className="text-sm text-destructive">{formError}</div>}

                    <div className="grid gap-2">
                        <div className="text-sm font-medium">Nombre</div>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Coca Cola" />
                    </div>

                    <div className="grid gap-2">
                        <div className="text-sm font-medium">Barcode (opcional)</div>
                        <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Ej: 0123456789" />
                    </div>

                    <div className="grid gap-2">
                        <div className="text-sm font-medium">Descripción (opcional)</div>
                        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: 2L" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <div className="text-sm font-medium">Marca</div>
                            <AsyncComboboxSingle
                                value={brandId}
                                onChange={setBrandId}
                                placeholder="Seleccionar marca…"
                                searchPlaceholder="Buscar marca…"
                                emptyText="Sin marcas."
                                disabled={submitting}
                                loadState={brands.loadState}
                                loadError={brands.loadError}
                                items={brands.items.map((b) => ({ value: b.id, label: b.name }))}
                                search={brands.search}
                                setSearch={brands.setSearch}
                                ensureLoaded={brands.ensureLoaded}
                            />
                        </div>

                        <div className="grid gap-2">
                            <div className="text-sm font-medium">Categoría</div>
                            <AsyncComboboxSingle
                                value={categoryId}
                                onChange={setCategoryId}
                                placeholder="Seleccionar categoría…"
                                searchPlaceholder="Buscar categoría…"
                                emptyText="Sin categorías."
                                disabled={submitting}
                                loadState={categories.loadState}
                                loadError={categories.loadError}
                                items={categories.items.map((c) => ({ value: c.id, label: c.slugPath ?? c.name }))}
                                search={categories.search}
                                setSearch={categories.setSearch}
                                ensureLoaded={categories.ensureLoaded}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="secondary" onClick={() => props.onOpenChange(false)} disabled={submitting}>
                            Cancelar
                        </Button>
                        <Button onClick={() => void submit()} disabled={submitting || !name.trim() || !categoryId}>
                            Guardar
                        </Button>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
