#!/usr/bin/env python3
"""Deterministic (seeded) generation of structured business documents and signed instances of form templates. No LLM.

Every document records planted_features so ground truth can be derived later. Run after prose.py (instances read the templates).
"""
import datetime as dt, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib")); sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import DOCS, RAW, rng_for, fake_person, write_doc
from specs_gen import PLANTS

N = 0
EXPECTED = []
def D(s): return dt.date.fromisoformat(s)
def long(d): d = D(d) if isinstance(d, str) else d; return d.strftime("%B %-d, %Y")
def money(x): return f"${x:,.2f}"


def emit(doc_id, rel, text, **meta):
    global N; N += 1; EXPECTED.append(doc_id)
    area = rel.split("/")[0]
    meta.setdefault("status", "active")
    write_doc(doc_id, rel, text, {"area": area, "cluster": meta.pop("cluster", None), "source_class": "generated_structured", **meta})


# ------------------------------------------------------------------ catalog
ITEMS = {
 "L34": ("Type L hard-drawn copper water tube, 3/4 in. x 20 ft (ASTM B88)", "7411.10.1030", "20 FT LEN", 58.40, 0.455),
 "L1":  ("Type L hard-drawn copper water tube, 1 in. x 20 ft (ASTM B88)", "7411.10.1030", "20 FT LEN", 86.10, 0.655),
 "K1C": ("Type K soft copper water tube, 1 in. x 60 ft coil (ASTM B88)", "7411.10.1030", "COIL", 318.00, 0.839),
 "M12": ("Type M hard-drawn copper water tube, 1/2 in. x 20 ft (ASTM B88)", "7411.10.1030", "20 FT LEN", 24.90, 0.204),
 "ACR38": ("ACR copper refrigeration tube, 3/8 in. OD x 50 ft coil (ASTM B280)", "7411.10.5000", "COIL", 64.75, 0.126),
 "E34": ("Wrot copper 90-degree elbow, 3/4 in. C x C", "7412.10.0000", "EA", 2.18, None),
 "T1":  ("Wrot copper tee, 1 in. C x C x C", "7412.10.0000", "EA", 7.95, None),
 "PC12": ("Copper press coupling, 1/2 in. with EPDM seal", "7412.10.0000", "EA", 4.10, None),
 "BPF34": ("Lead-free brass press adapter, 3/4 in. press x MNPT", "7412.20.0000", "EA", 11.35, None),
 "BBV1": ("Lead-free brass full-port ball valve, 1 in. threaded", "8481.80.1095", "EA", 21.60, None),
 "WH50": ("50-gallon natural gas water heater, 40,000 BTU, 6-yr warranty", "8419.11.0000", "EA", 1148.00, None),
 "TWH": ("Condensing tankless water heater, 199,000 BTU, indoor", "8419.11.0000", "EA", 1685.00, None),
 "HP3": ("3-ton split-system heat pump outdoor unit, 16 SEER2 (residential)", "8418.61.0101", "EA", 3890.00, None),
 "AC3": ("3-ton split-system air conditioner condenser, 15.2 SEER2 (residential)", "8415.10.6040", "EA", 3120.00, None),
 "AH3": ("3-ton multi-position air handler with ECM blower (residential)", "8415.83.0090", "EA", 1760.00, None),
 "RTU10": ("10-ton packaged rooftop unit, gas/electric (light commercial)", "8415.82.0145", "EA", 14850.00, None),
 "PEX34": ("PEX-A tubing, 3/4 in. x 300 ft coil", "3917.32.0050", "COIL", 212.00, None),
}


def po_doc(po_no, date, vendor, vendor_addr, ship_to, lines, terms_ref, incoterm, notes="", buyer="Meridian Mechanical Group, Inc.", extra_lines=None):
    rows = []; sub = 0.0
    for i, (code, qty) in enumerate(lines, 1):
        desc, hts, uom, price, _ = ITEMS[code]; amt = qty * price; sub += amt
        rows.append(f"| {i} | {code} | {desc} | {hts} | {qty:,} | {uom} | {money(price)} | {money(amt)} |")
    extra = ""
    for label, amt in (extra_lines or []):
        extra += f"| | | {label} | | | | | {money(amt)} |\n"; sub += amt
    return f"""PURCHASE ORDER

{buyer}
d/b/a Meridian Plumbing, Heating & Air
2150 Harbor Point Drive, Suite 400, Sacramento, CA 95833 | Purchasing: (916) 555-0100 | ap@meridianmech.com

PO Number: {po_no}                      PO Date: {long(date)}
Vendor: {vendor}
Vendor Address: {vendor_addr}
Ship To: {ship_to}
Delivery Terms: {incoterm}
Payment Terms: Net 30
Buyer: Grant Holloway, Director of Purchasing

| Line | Item | Description | HTS (per vendor) | Qty | UOM | Unit Price | Extended |
|---|---|---|---|---|---|---|---|
{chr(10).join(rows)}
{extra}
Subtotal (before sales tax): {money(sub)}

TERMS: {terms_ref}
{notes}
Authorized by: Grant Holloway, Director of Purchasing
"""


def supplier_invoice(inv_no, date, seller, seller_addr, po_no, lines, charges, terms_line, incoterm):
    rows = []; sub = 0.0
    for i, (code, qty) in enumerate(lines, 1):
        desc, hts, uom, price, _ = ITEMS[code]; amt = qty * price; sub += amt
        rows.append(f"| {i} | {desc} | {hts} | {qty:,} {uom} | {money(price)} | {money(amt)} |")
    ch = []; total = sub
    for label, pct in charges:
        amt = round(sub * pct, 2); total += amt; ch.append(f"| | {label} | | | {pct*100:.1f}% | {money(amt)} |")
    return f"""INVOICE

{seller}
{seller_addr}

Invoice No.: {inv_no}          Invoice Date: {long(date)}
Bill To: Meridian Mechanical Group, Inc., Accounts Payable, 2150 Harbor Point Drive, Suite 400, Sacramento, CA 95833
Customer PO: {po_no}           Shipping Terms: {incoterm}
Payment Terms: Net 30

| Line | Description | HTS | Quantity | Unit Price / Rate | Amount |
|---|---|---|---|---|---|
{chr(10).join(rows)}
{chr(10).join(ch)}

Merchandise: {money(sub)}
Invoice Total (before sales tax): {money(total)}

{terms_line}
"""


def letter(date, frm, to, subject, body, signer):
    return f"""{frm}

{long(date)}

{to}

Re: {subject}

{body}

Sincerely,

{signer}
"""


# ------------------------------------------------------------------ supply
def supply():
    GPC = ("Great Plains Copper Tube, Inc.", "4400 Foundry Road, Tulsa, OK 74107")
    ship = {"SAC": "Meridian Sacramento Warehouse, 2150 Harbor Point Drive, Sacramento, CA 95833", "TAC": "Meridian Tacoma Branch, 3310 South Pine Street, Tacoma, WA 98409",
            "ELK": "Meridian Elk Grove Village Branch, 1455 Busse Road, Elk Grove Village, IL 60007", "HOU": "Meridian Houston Branch, 10850 West Little York Road, Houston, TX 77041"}
    # GPC price list (in the MSA cluster)
    rows = "\n".join(f"| {c} | {ITEMS[c][0]} | {ITEMS[c][2]} | {money(ITEMS[c][3]*0.93)} | {ITEMS[c][4] or '-'} |" for c in ["L34", "L1", "K1C", "M12", "ACR38", "E34", "T1", "PC12"])
    emit("SUP-GPC-05", "supply/great-plains-copper-tube_master-supply-agreement/05_exhibit-a_price-list_effective-2026-01-01.md", f"""EXHIBIT A - PRICE LIST
to Master Supply Agreement dated November 1, 2019 between Great Plains Copper Tube, Inc. ("Seller") and Meridian Mechanical Group, Inc. ("Buyer"),
as amended by Amendment No. 1 dated April 1, 2022. Effective January 1, 2026 through December 31, 2026.

Base prices below assume a base COMEX HG copper price of $2.60/lb. The Metals Adjustment under Exhibit B applies monthly to the copper weight shown.

| Item | Description | Unit | Base Price | Copper lbs/ft |
|---|---|---|---|---|
{rows}

Freight: FCA Seller's mill, Tulsa, Oklahoma (Incoterms 2020); prepaid and added on orders under 5,000 lbs.
Price list issued December 12, 2025 by Great Plains Copper Tube, Inc. Commercial Department.
""", doc_type="pricing_exhibit", parent_id="SUP-GPC-01", counterparty="SUP-GPC", effective_date="2026-01-01", roles=["tariff", "price_adjustment"],
         cluster="great-plains-copper-tube_master-supply-agreement")
    # GPC POs and invoices (surcharge per Amendment No. 2; Aug-2026 invoice still charges the expired Section 122 rate)
    gpc = [("PO-2025-0112", "2025-01-14", "SAC", [("L34", 600), ("L1", 400), ("K1C", 30)], None),
           ("PO-2025-0588", "2025-06-09", "TAC", [("L34", 450), ("M12", 800), ("ACR38", 60)], None),
           ("PO-2026-0204", "2026-03-16", "ELK", [("L34", 700), ("L1", 350), ("E34", 2400)], ("GPC-INV-26-0877", "2026-03-27", [("Metals Adjustment per Exhibit B (COMEX avg $5.02/lb)", 0.412), ("Tariff Surcharge per Section 7(g) - Tariff Rate 10% less 5% threshold", 0.05)], "Section 122 period")),
           ("PO-2026-0461", "2026-06-02", "HOU", [("L1", 500), ("K1C", 40), ("T1", 1200)], ("GPC-INV-26-1402", "2026-06-12", [("Metals Adjustment per Exhibit B (COMEX avg $4.71/lb)", 0.366), ("Tariff Surcharge per Section 7(g) - Tariff Rate 10% less 5% threshold", 0.05)], "Section 122 period")),
           ("PO-2026-0693", "2026-08-11", "SAC", [("L34", 800), ("M12", 600), ("PC12", 3000)], None),
           ("PO-2026-0788", "2026-09-14", "TAC", [("L1", 600), ("ACR38", 80)], None)]
    for po, d, br, lines, inv in gpc:
        emit(f"SUP-GPC-{po}", f"supply/purchase-orders/{po}_great-plains-copper-tube_{d}.md",
             po_doc(po, d, GPC[0], GPC[1], ship[br], lines, "This Purchase Order is issued under and governed by the Master Supply Agreement dated November 1, 2019 between Seller and Buyer, as amended. Pricing per Exhibit A; Metals Adjustment per Exhibit B.", "FCA Seller's mill, Tulsa, Oklahoma (Incoterms 2020)"),
             doc_type="purchase_order", parent_id="SUP-GPC-01", counterparty="SUP-GPC", effective_date=d, roles=["tariff"])
        if inv:
            no, idate, charges, note = inv
            emit(f"SUP-GPC-{no}", f"supply/invoices/{no}_great-plains-copper-tube_{idate}.md",
                 supplier_invoice(no, idate, GPC[0], GPC[1], po, lines, charges, "Tariff Surcharge assessed under Section 7(g) of the Master Supply Agreement (Amendment No. 2). Seller is the importer of record for imported inputs.", "FCA Seller's mill, Tulsa, OK (Incoterms 2020)"),
                 doc_type="supplier_invoice", parent_id="SUP-GPC-01", counterparty="SUP-GPC", effective_date=idate, roles=["tariff", "surcharge", "refund_chain"],
                 planted_features=["surcharge_after_section122_expiry"] if "after" in note else ["tariff_surcharge"])
    # PO-2026-0693 is invoiced in two parts: tube (clean overcharge after Section 122 expiry) and fittings (ambiguous: possible Section 232 successor duty)
    emit("SUP-GPC-GPC-INV-26-1911", "supply/invoices/GPC-INV-26-1911_great-plains-copper-tube_2026-08-21.md",
         supplier_invoice("GPC-INV-26-1911", "2026-08-21", GPC[0], GPC[1], "PO-2026-0693 (partial: lines 1-2, copper water tube)", [("L34", 800), ("M12", 600)],
                          [("Metals Adjustment per Exhibit B (COMEX avg $4.66/lb)", 0.358), ("Tariff Surcharge per Section 7(g) - Section 122 Tariff Rate 10% (Proclamation 11012) less 5% threshold", 0.05)],
                          "Products on this invoice: copper water tube manufactured at Seller's Tulsa mill from imported refined copper cathode (HTS 7403.11). Tariff Surcharge assessed under Section 7(g) of the Master Supply Agreement (Amendment No. 2) at the Section 122 Tariff Rate. Seller is the importer of record for imported inputs.",
                          "FCA Seller's mill, Tulsa, OK (Incoterms 2020)"),
         doc_type="supplier_invoice", parent_id="SUP-GPC-01", counterparty="SUP-GPC", effective_date="2026-08-21", roles=["tariff", "surcharge", "refund_chain"],
         planted_features=["surcharge_after_section122_expiry"])
    emit("SUP-GPC-GPC-INV-26-1912", "supply/invoices/GPC-INV-26-1912_great-plains-copper-tube_2026-08-21.md",
         supplier_invoice("GPC-INV-26-1912", "2026-08-21", GPC[0], GPC[1], "PO-2026-0693 (partial: line 3, copper press couplings)", [("PC12", 3000)],
                          [("Tariff Surcharge per Section 7(g) - Tariff Rate 10% less 5% threshold (imported fittings components)", 0.05)],
                          "Products on this invoice: copper press couplings assembled by Seller from imported copper fittings components. Tariff Surcharge assessed under Section 7(g) of the Master Supply Agreement (Amendment No. 2). Seller is the importer of record for imported inputs.",
                          "FCA Seller's mill, Tulsa, OK (Incoterms 2020)"),
         doc_type="supplier_invoice", parent_id="SUP-GPC-01", counterparty="SUP-GPC", effective_date="2026-08-21", roles=["tariff", "surcharge", "needs_review"],
         planted_features=["ambiguous_surcharge_possible_s232_successor_needs_review"])
    # Keystone (implicit pass-through; duties in addition)
    KPS = ("Keystone Plumbing Supply, LLC", "12500 Jefferson Avenue, Newport News, VA 23602 (Branch 0417, Sacramento, CA)")
    kps_terms = lambda d: f"Seller's Terms and Conditions of Sale published at https://www.keystoneplumbingsupply.com/terms-of-sale ({'as published June 2025' if d >= '2025-06-08' else 'as published October 2019'}) apply to this order."
    kps = [("PO-2024-1130", "2024-11-18", "SAC", [("WH50", 12), ("BBV1", 60), ("PEX34", 20)]), ("PO-2025-0231", "2025-02-24", "HOU", [("E34", 1800), ("BBV1", 90), ("WH50", 8)]),
           ("PO-2025-0419", "2025-04-21", "ELK", [("TWH", 6), ("BPF34", 400), ("L34", 200)]), ("PO-2025-0703", "2025-07-14", "SAC", [("WH50", 16), ("PC12", 1500)]),
           ("PO-2025-0914", "2025-09-15", "TAC", [("BBV1", 120), ("BPF34", 300), ("TWH", 4)]), ("PO-2026-0118", "2026-01-26", "HOU", [("WH50", 10), ("E34", 1200)])]
    for po, d, br, lines in kps:
        emit(f"SUP-KPS-{po}", f"supply/purchase-orders/{po}_keystone-plumbing-supply_{d}.md",
             po_doc(po, d, KPS[0], KPS[1], ship[br], lines, kps_terms(d), "FCA Seller's facility (Incoterms 2020)" if d >= "2025-06-08" else "F.O.B. point of shipment"),
             doc_type="purchase_order", counterparty="SUP-KPS", effective_date=d, roles=["tariff", "incorporated_web_terms"])
    for no, idate, po, lines in [("KPS-417-558210", "2025-04-30", "PO-2025-0419", [("TWH", 6), ("BPF34", 400), ("L34", 200)]),
                                ("KPS-417-601877", "2025-09-24", "PO-2025-0914", [("BBV1", 120), ("BPF34", 300), ("TWH", 4)])]:
        emit(f"SUP-KPS-{no}", f"supply/invoices/{no}_keystone-plumbing-supply_{idate}.md",
             supplier_invoice(no, idate, KPS[0], KPS[1], po, lines, [("Import duty recovery - IEEPA reciprocal and fentanyl duties (EO 14257 / 14194)", 0.062)],
                              "All taxes, transportation costs, duties and other charges are in addition to quoted prices (Seller's Terms and Conditions of Sale, Section 3).", "FCA Seller's facility (Incoterms 2020)"),
             doc_type="supplier_invoice", counterparty="SUP-KPS", effective_date=idate, roles=["tariff", "refund_chain", "ieepa"], planted_features=["ieepa_duty_passthrough_no_refund_clause"])
    # Lakeshore (tariff clause added Rev 020425; price-increase notice)
    LWP = ("Lakeshore Waterworks & PVF, LP", "8800 Riverport Drive, St. Louis, MO 63043")
    for po, d, br, lines in [("PO-2024-0822", "2024-08-26", "ELK", [("K1C", 25), ("BBV1", 80)]), ("PO-2024-1207", "2024-12-09", "HOU", [("K1C", 30), ("L1", 300)]),
                             ("PO-2025-0506", "2025-05-12", "ELK", [("K1C", 40), ("BBV1", 100)]), ("PO-2026-0322", "2026-03-30", "HOU", [("L1", 400), ("K1C", 20)])]:
        rev = "Rev 020425" if d >= "2025-02-04" else "Rev 091718"
        emit(f"SUP-LWP-{po}", f"supply/purchase-orders/{po}_lakeshore-waterworks-pvf_{d}.md",
             po_doc(po, d, LWP[0], LWP[1], ship[br], lines, f"Seller's Terms and Conditions of Sale ({rev}) published at https://www.lakeshorepvf.com/terms-of-sale apply.", "F.O.B. Seller's branch"),
             doc_type="purchase_order", counterparty="SUP-LWP", effective_date=d, roles=["tariff", "incorporated_web_terms"])
    emit("SUP-LWP-NOTICE-2025-03", "supply/supplier-notices/lakeshore-waterworks-pvf_price-increase-notice_2025-03-10.md",
         letter("2025-03-10", "Lakeshore Waterworks & PVF, LP\n8800 Riverport Drive, St. Louis, MO 63043", "Meridian Mechanical Group, Inc.\nAttn: Purchasing\n2150 Harbor Point Drive, Suite 400\nSacramento, CA 95833",
                "Notice of Price Increase - Tariff-Affected Products",
                "In accordance with our Terms and Conditions of Sale (Rev 020425), this letter provides written notice that, effective April 1, 2025, prices for copper tube, brass valves and ductile fittings will increase by 9% and a separate tariff surcharge of 4% will apply to imported valve and fitting products, to address increased costs resulting from recently announced tariffs, including tariffs imposed under the International Emergency Economic Powers Act and Section 232 of the Trade Expansion Act of 1962. Quotations issued before April 1, 2025 will be honored through their stated expiration dates.",
                "Marissa Kowalczyk\nRegional Pricing Manager"),
         doc_type="supplier_notice", counterparty="SUP-LWP", effective_date="2025-03-10", roles=["tariff", "price_increase_notice", "ieepa"])
    # Northaire (HVAC; 12/10/24 terms reach equipment; one-way ratchet)
    NCS = ("Northaire Comfort Systems Corporation", "7700 Innovation Way, Palm Beach Gardens, FL 33418")
    for po, d, br, lines in [("PO-2024-1016", "2024-10-21", "SAC", [("HP3", 24), ("AH3", 24)]), ("PO-2025-0307", "2025-03-17", "HOU", [("AC3", 30), ("AH3", 30)]),
                             ("PO-2025-0822", "2025-08-25", "TAC", [("HP3", 36), ("AH3", 36)]), ("PO-2026-0715", "2026-07-20", "SAC", [("HP3", 40), ("RTU10", 2)])]:
        rev = "Rev. 08/21/26" if d >= "2026-08-21" else "Rev. 12/10/24" if d >= "2024-12-10" else "Rev. 07/23/24"
        emit(f"SUP-NCS-{po}", f"supply/purchase-orders/{po}_northaire-comfort-systems_{d}.md",
             po_doc(po, d, NCS[0], NCS[1], ship[br], lines, f"Equipment sold under the Authorized Dealer Agreement dated January 15, 2020 and Northaire's Terms and Conditions of Sale ({rev}) at https://www.northaire.com/terms-of-sale.", "FCA Northaire distribution center (Incoterms 2020)"),
             doc_type="purchase_order", counterparty="SUP-NCS", effective_date=d, roles=["tariff", "incorporated_web_terms"])
    emit("SUP-NCS-NOTICE-2025-01", "supply/supplier-notices/northaire-comfort-systems_tariff-price-adjustment-notice_2025-01-06.md",
         letter("2025-01-06", "Northaire Comfort Systems Corporation\nDealer Pricing\n7700 Innovation Way, Palm Beach Gardens, FL 33418", "Meridian Mechanical Group, Inc. (Authorized Dealer No. ND-44817)\n2150 Harbor Point Drive, Suite 400, Sacramento, CA 95833",
                "30-Day Notice of Price Adjustment - Equipment and Services",
                "Pursuant to Section 33 of Northaire's Terms and Conditions of Sale (Rev. 12/10/24), Northaire provides thirty (30) days' prior written notice that, effective February 5, 2025, a tariff and trade-policy surcharge of 6% will apply to all equipment and parts invoices, and list prices for residential split systems will increase 4.5%. Consistent with Section 33, adjusted prices are not subject to decrease.",
                "Northaire Dealer Pricing Team"), doc_type="supplier_notice", counterparty="SUP-NCS", effective_date="2025-01-06", roles=["tariff", "price_increase_notice", "one_way_ratchet"])
    emit("SUP-NCS-NOTICE-2026-06", "supply/supplier-notices/northaire-comfort-systems_dealer-bulletin_2026-06-15.md",
         letter("2026-06-15", "Northaire Comfort Systems Corporation\nDealer Communications", "All Authorized Dealers",
                "Dealer Bulletin DB-2026-11: Section 232 Changes Effective June 8, 2026",
                "Proclamation 11032 moved certain residential HVAC systems and components into a temporary reduced Section 232 tier effective June 8, 2026. Northaire's tariff and trade-policy surcharge of 6% remains in effect for all equipment. As provided in our Terms and Conditions of Sale, prices adjusted for tariffs and trade policy are not subject to decrease. Dealers with questions should contact their territory manager.",
                "Northaire Dealer Communications"), doc_type="supplier_notice", counterparty="SUP-NCS", effective_date="2026-06-15", roles=["tariff", "one_way_ratchet"], planted_features=["ratchet_after_tariff_decrease"])
    # Delmont (job quotes with price protection)
    DSC = ("Delmont Supply Company", "1200 West Hamilton Street, Allentown, PA 18102 (Sacramento Branch)")
    for q, d, days, proj, lines in [("Q-2025-44710", "2025-05-28", 60, "Capitol Tower Chiller Replacement, 1020 J Street, Sacramento, CA", [("L1", 900), ("T1", 600), ("BBV1", 140)]),
                                     ("Q-2025-45122", "2025-02-18", 45, "Puyallup Medical Office Building, Puyallup, WA", [("L34", 1200), ("E34", 3000), ("ACR38", 120)])]:
        rows = "\n".join(f"| {ITEMS[c][0]} | {n:,} | {money(ITEMS[c][3])} | {money(n*ITEMS[c][3])} |" for c, n in lines)
        exp = (D(d) + dt.timedelta(days=days)).isoformat()
        emit(f"SUP-DSC-{q}", f"supply/quotes/{q}_delmont-supply_job-quotation_{d}.md", f"""WRITTEN JOB QUOTATION - PRICE PROTECTED

Delmont Supply Company | Quote No. {q} | Date: {long(d)}
Customer: Meridian Mechanical Group, Inc.
Project: {proj}

| Item | Qty | Unit Price | Extended |
|---|---|---|---|
{rows}

PRICE PROTECTION: Prices on this written job quotation are protected for {days} days, through {long(exp)}, for release orders referencing this quote number and shipping to the named project. Orders after that date are priced at Seller's prices in effect at shipment.
Sales are subject to Delmont Supply Company Sales Order Terms and Conditions.
Quoted by: Omar Lindqvist, Project Sales
""", doc_type="supplier_quote", counterparty="SUP-DSC", effective_date=d, roles=["tariff", "price_protection"], planted_features=["price_protection_expiry:" + exp])
    for po, d, q in [("PO-2025-0611", "2025-06-16", "Q-2025-44710"), ("PO-2025-0827", "2025-08-29", "Q-2025-44710"), ("PO-2025-0402", "2025-03-24", "Q-2025-45122")]:
        lines = [("L1", 300), ("T1", 200)] if "44710" in q else [("L34", 600), ("E34", 1500)]
        emit(f"SUP-DSC-{po}", f"supply/purchase-orders/{po}_delmont-supply_{d}.md",
             po_doc(po, d, DSC[0], DSC[1], ship["SAC"] if "44710" in q else ship["TAC"], lines, f"Release against Delmont written job quotation {q}; pricing per quotation. Delmont Sales Order Terms and Conditions apply.", "F.O.B. job site"),
             doc_type="purchase_order", counterparty="SUP-DSC", effective_date=d, roles=["tariff", "price_protection"])
    # Hai Phong (CIF; Meridian is importer of record) + customs broker entry summaries
    HPB = ("Hai Phong Precision Brass Co., Ltd.", "Lot C4 Trang Due Industrial Park, An Duong District, Hai Phong, Vietnam")
    for po, d, lines in [("PO-2025-0215", "2025-02-17", [("BPF34", 8000), ("PC12", 12000)]), ("PO-2025-0618", "2025-06-23", [("BPF34", 10000), ("PC12", 15000)]),
                         ("PO-2025-1027", "2025-10-27", [("BPF34", 9000)]), ("PO-2026-0409", "2026-04-13", [("BPF34", 12000), ("PC12", 10000)])]:
        emit(f"SUP-HPB-{po}", f"supply/purchase-orders/{po}_hai-phong-precision-brass_{d}.md",
             po_doc(po, d, HPB[0], HPB[1], ship["SAC"], lines, "Issued under Supply Contract No. MMG-HPB-2023-01 dated May 15, 2023. Buyer is importer of record.", "CIF Port of Long Beach (Incoterms 2020)"),
             doc_type="purchase_order", parent_id="SUP-HPB-01", counterparty="SUP-HPB", effective_date=d, roles=["tariff", "importer_of_record"])
    for ent, d, po, val, dutylines in [("MX7-2291846-3", "2025-07-28", "PO-2025-0618", 176500.00, [("7412.20.0000 brass fittings - MFN duty 3.0%", 0.03), ("9903.01.25 IEEPA reciprocal duty 10% (EO 14257)", 0.10)]),
                                       ("MX7-2304417-9", "2025-12-15", "PO-2025-1027", 102150.00, [("7412.20.0000 brass fittings - MFN duty 3.0%", 0.03), ("9903.78.01 Section 232 copper - 50% of copper content value ($61,290)", 0.30), ("IEEPA reciprocal duty 20% on non-copper content (EO 14257, as modified)", 0.08)])]:
        rows = "\n".join(f"| {l} | {money(round(val*p,2))} |" for l, p in dutylines)
        tot = round(sum(val * p for _, p in dutylines), 2)
        emit(f"SUP-HPB-ENTRY-{ent}", f"supply/customs/{ent}_entry-summary-and-broker-invoice_{d}.md", f"""CUSTOMS BROKER STATEMENT - ENTRY SUMMARY (CBP FORM 7501 DATA)

Broker: Pacific Gateway Customs Brokerage, Inc., Long Beach, CA
Importer of Record: Meridian Mechanical Group, Inc. (IOR No. 84-3317265)
Entry No.: {ent}      Entry Date: {long(d)}      Port: 2704 Los Angeles/Long Beach
Country of Origin: Vietnam      Manufacturer: Hai Phong Precision Brass Co., Ltd.
Invoice/PO: {po}      Entered Value: {money(val)}
Liquidation status: unliquidated as of statement date

| Tariff line / duty | Amount |
|---|---|
{rows}

Total duties deposited by importer of record: {money(tot)}
Merchandise Processing Fee and Harbor Maintenance Fee billed separately.
Broker note: IEEPA duties deposited on this entry may be eligible for refund to the importer of record under CBP's post-Learning Resources refund process; importer must file any required declaration.
""", doc_type="customs_entry", parent_id="SUP-HPB-01", counterparty="SUP-HPB", effective_date=d, roles=["tariff", "importer_of_record", "refund_chain", "ieepa"],
             planted_features=["meridian_is_ior_ieepa_refund_eligible"])


# ------------------------------------------------------------------ customers
def customers():
    agencies = [("WA-WSDOT-OR", "2025-11-03", "Washington State Department of Transportation, Olympic Region", "Replace failed condensing unit and repair refrigerant piping, Tumwater maintenance facility", 18450),
                ("WA-UWT-22", "2026-01-12", "University of Washington Tacoma, Facilities Services", "Quarterly preventive maintenance, 6 rooftop units, Jan-Dec 2026", 26800),
                ("WA-DOC-CRCC", "2026-03-02", "Washington State Department of Corrections, Coyote Ridge Corrections Center", "Emergency boiler repair and domestic hot water heater replacement", 41275),
                ("WA-PARKS-07", "2026-06-22", "Washington State Parks and Recreation Commission, Southwest Region", "HVAC replacement at ranger station, including copper line sets", 22940)]
    for po, d, agency, scope, amt in agencies:
        emit(f"CUS-WADES-PO-{po}", f"customers/work-orders/{po}_wa-des-04224-purchase-order_{d}.md", f"""PURCHASE ORDER UNDER WASHINGTON STATE MASTER CONTRACT NO. 04224 (HVAC SERVICES)

Purchaser: {agency}
Contractor: Meridian Mechanical of Washington, LLC (Contract 04224, awarded regions per Exhibit B)
PO No.: {po}          PO Date: {long(d)}
Scope: {scope}
Not-to-exceed amount: {money(amt)}
Pricing: Labor at the prevailing-wage-plus-markup rates in Exhibit B; parts at cost plus the Contract markup; truck charge per Exhibit B. No tariffs or additional fees are approved under Contract 04224.
This purchase order incorporates Master Contract No. 04224 and its Exhibits. Prevailing wages apply (RCW 39.12).
Authorized: Purchasing Officer
""", doc_type="work_order", parent_id="CUS-WADES-01", counterparty="CUS-WADES", effective_date=d, roles=["tariff", "price_ceiling"])
    for to, d, desc, amt in [("TO-134953-0418", "2025-05-05", "Chiller plant controls upgrade, Lakeport Public Safety Headquarters", 214600), ("TO-134953-0452", "2026-02-09", "Replacement of two 25-ton rooftop units, Lakeport Central Library", 188300)]:
        emit(f"CUS-LKP-{to}", f"customers/work-orders/{to}_city-of-lakeport-task-order_{d}.md", f"""CITY OF LAKEPORT, ILLINOIS - DEPARTMENT OF ASSETS, INFORMATION AND SERVICES
TASK ORDER {to} UNDER REFERENCE CONTRACT PO 134953 (HVAC PRODUCTS, INSTALLATION, SERVICES)

Contractor: Meridian Mechanical of Illinois, LLC       Date: {long(d)}
Description: {desc}
Firm fixed price for this Task Order: {money(amt)}, based on the Contract pricing in effect on the Task Order date.
Invoices that include price or wage escalations will be rejected unless the Contract expressly provides for them.
Completion: 120 days from Notice to Proceed.
""", doc_type="work_order", parent_id="CUS-LKP-01", counterparty="CUS-LKP", effective_date=d, roles=["tariff", "fixed_price"])
    for jo, d, ed, desc, base in [("JO-2024-031", "2024-04-15", "2024", "Replace domestic water piping, Terminal B restrooms", 96400), ("JO-2025-017", "2025-03-03", "2025", "Backflow preventer replacements (14 assemblies)", 58250), ("JO-2026-009", "2026-02-02", "2026", "Grease interceptor and sanitary line replacement, concourse food court", 131900)]:
        emit(f"CUS-SMB-{jo}", f"customers/work-orders/{jo}_city-of-san-marcos-bend-job-order_{d}.md", f"""CITY OF SAN MARCOS BEND - JOB ORDER
Annual Job Order Contract: On-Call Plumbing Services (San Marcos Bend Regional Airport)
Job Order No.: {jo}      Date: {long(d)}      Contractor: Meridian Mechanical of Texas, LLC
Scope: {desc}
Pricing basis: RSMeans Plumbing Cost Data, {ed} edition line items x Contractor's Coefficient 1.18 (normal hours)
Job Order Price: {money(base)}
Payment and performance bonds per Tex. Gov't Code ch. 2253 apply above $100,000.
""", doc_type="work_order", parent_id="CUS-SMB-01", counterparty="CUS-SMB", effective_date=d, roles=["tariff", "indirect_escalator"])
    wos = [("CUS-HRP-MSA", "HRP", "Harborview Realty Partners, LP", ["2025-02-10", "2025-07-21", "2026-05-04"]), ("CUS-CRT-MSA", "CRT", "Crestline Retail Trust", ["2024-11-04", "2025-08-18", "2026-04-13"]),
           ("CUS-VMS-MSA", "VMS", "Valley Medical Services Group", ["2025-05-19", "2026-03-09"]), ("CUS-SPS-MSA", "SPS", "Sunpoint Public Schools Cooperative", ["2025-06-23", "2026-05-26"]),
           ("CUS-OAK-MSA", "OAK", "Oakridge Hospitality Group, LLC", ["2025-10-06", "2026-08-10"])]
    for parent, code, cust, dates in wos:
        for i, d in enumerate(dates, 1):
            r = rng_for("wo", code, d); amt = r.randint(8, 95) * 1000 + r.randint(0, 999)
            scope = r.choice(["Replace failed 7.5-ton rooftop unit and reconnect copper refrigerant lines", "Repipe domestic water risers with Type L copper, floors 1-4",
                              "Replace two 100-gallon commercial water heaters", "Annual preventive maintenance and coil cleaning", "Replace boiler circulation pumps and brass isolation valves"])
            wo = f"WO-{code}-{d[:4]}-{i:02d}"
            emit(f"CUS-{code}-{wo}", f"customers/work-orders/{wo}_{code.lower()}_{d}.md", f"""WORK ORDER {wo}
Issued under the Master Agreement between {cust} ("Customer") and Meridian ("Contractor").
Date: {long(d)}
Site: {r.choice(['Building A', 'Main campus', 'North property', 'Tower 2', 'Store #114'])}
Scope of Work: {scope}
Estimated labor: {r.randint(12, 180)} hours at Exhibit A rates; materials per Exhibit A pricing terms.
Not-to-exceed amount: {money(amt)}
Requested completion: {long((D(d) + dt.timedelta(days=r.randint(10, 60))).isoformat())}
Approved for Customer: Facilities Manager          Accepted for Contractor: Service Operations Manager
""", doc_type="work_order", parent_id=parent, counterparty="CUS-" + code, effective_date=d, roles=["tariff"])
    # Sunpoint renewal history as separate letters (the 2021 MSA cannot narrate later events); cluster with the MSA.
    SPS_CL = "sunpoint-public-schools-cooperative_mechanical-services-contract"
    SPS_FROM = "Sunpoint Public Schools Cooperative\n800 South Plum Grove Road, Palatine, IL 60067"
    SPS_TO = "Meridian Mechanical of Illinois, LLC\n1455 Busse Road, Elk Grove Village, IL 60007"
    SPS_RE = "Mechanical Services Contract awarded under RFP SPSC-2021-07, dated July 1, 2021 (the \"Agreement\")"
    for doc_id, fname, d, subj, body in [
        ("CUS-SPS-RENEW-1", "02_notice-of-renewal_first-option_2024-04-15.md", "2024-04-15", "Notice of Exercise of First Renewal Option - " + SPS_RE,
         "Pursuant to Section 5.2 of the Agreement, the Cooperative hereby exercises its first one-year renewal option. The Agreement is renewed on the same terms and conditions for the period July 1, 2024 through June 30, 2025."),
        ("CUS-SPS-RENEW-2", "03_notice-of-renewal_second-option_2025-04-14.md", "2025-04-14", "Notice of Exercise of Second Renewal Option - " + SPS_RE,
         "Pursuant to Section 5.2 of the Agreement, the Cooperative hereby exercises its second one-year renewal option. The Agreement is renewed on the same terms and conditions for the period July 1, 2025 through June 30, 2026. This is the final renewal option available under Section 5.2."),
        ("CUS-SPS-EXPIRY", "04_notice-of-expiration-and-resolicitation_2026-04-20.md", "2026-04-20", "Notice of Expiration and Re-Solicitation - " + SPS_RE,
         "The Agreement's final renewal period ends June 30, 2026, and no further renewal options remain under Section 5.2. The Agreement will therefore expire on June 30, 2026 in accordance with Section 5.3. The Cooperative intends to re-solicit these services under RFP SPSC-2026-08 and invites Meridian to respond. Task Orders issued before June 30, 2026 shall be completed in accordance with Section 5.3; no new Task Orders will be issued under the Agreement after that date."),
    ]:
        emit(doc_id, f"customers/{SPS_CL}/{fname}", letter(d, SPS_FROM, SPS_TO, subj, body, "Tom Richardson\nDirector of Facilities"),
             doc_type="customer_notice", parent_id="CUS-SPS-MSA", counterparty="CUS-SPS", effective_date=d, cluster=SPS_CL, roles=["renewal", "term_status"])
    emit("CUS-HRP-MATADJ-NOTICE", "customers/notices/meridian_notice-of-material-cost-adjustment_harborview_2025-04-14.md",
         letter("2025-04-14", "Meridian Mechanical Group, Inc.\n2150 Harbor Point Drive, Suite 400, Sacramento, CA 95833", "Harborview Realty Partners, LP\nAttn: Director of Facilities\n500 Capitol Mall, Suite 1800, Sacramento, CA 95814",
                "Notice of Material Cost Adjustment under Master Facilities Maintenance Services Agreement dated March 1, 2022",
                "Pursuant to the Material Cost Adjustments section of the Agreement, Meridian gives thirty (30) days' written notice that, for Work Orders issued on or after May 15, 2025, pricing for copper tube, copper and brass fittings and HVAC equipment will be adjusted to reflect documented cost increases from our suppliers resulting from newly imposed tariffs. Supporting supplier notices (Lakeshore Waterworks & PVF, March 10, 2025; Northaire Comfort Systems, January 6, 2025) are enclosed. The adjustment is limited to our documented cost increase without additional markup.",
                "Lauren M. Whitfield\nGeneral Counsel"), doc_type="outgoing_notice", parent_id="CUS-HRP-MSA", counterparty="CUS-HRP", effective_date="2025-04-14", roles=["tariff", "pass_through"])
    emit("CUS-CONCESSION-HRP", "customers/notices/meridian_pricing-concession-letter_harborview_2025-09-02.md",
         letter("2025-09-02", "Meridian Mechanical Group, Inc.", "Harborview Realty Partners, LP", "Pricing Accommodation - Material Cost Adjustment",
                "As discussed, and as an accommodation in connection with Harborview's award of the Capitol Tower chiller replacement, Meridian will waive the material cost adjustment described in our April 14, 2025 notice for Work Orders issued between September 15, 2025 and March 15, 2026 at Harborview's Northern California properties. This accommodation does not amend the Agreement.",
                "Daniel R. Okafor\nChief Executive Officer"), doc_type="pricing_concession", counterparty="CUS-HRP", effective_date="2025-09-02", roles=["mfn", "l2_link"],
         planted_features=["concession_ca_customer_not_triggering_tx_only_mfn"])
    emit("CUS-CONCESSION-NBC", "customers/notices/meridian-illinois_pricing-letter-agreement_northbrook-commons_2026-02-17.md",
         letter("2026-02-17", "Meridian Mechanical of Illinois, LLC\n1455 Busse Road, Elk Grove Village, IL 60007", "Northbrook Commons Condominium Association\nc/o Lakefront Community Management, 1717 Lake Cook Road, Deerfield, IL 60015",
                "Pricing Letter Agreement - Mechanical Maintenance Services (Calendar Year 2026)",
                "This letter agreement confirms Meridian's pricing for HVAC, boiler and plumbing maintenance and repair services for the Association's three buildings during calendar year 2026: (1) labor at prevailing wage plus 34% markup, and (2) no tariff or material surcharge on copper tube, fittings or HVAC equipment, which will be invoiced at Meridian's cost plus 12%. Please countersign below to confirm.\n\nAccepted: Northbrook Commons Condominium Association, by its Board President",
                "Marcus T. Delgado\nVice President, Operations"), doc_type="pricing_concession", counterparty="CUS-NBC", effective_date="2026-02-17", roles=["mfn", "l2_link", "il"],
         planted_features=["il_concession_triggers_sunpoint_mfn"])
    for i, (d, desc, amt) in enumerate([("2025-08-11", "Owner-directed relocation of cooling tower make-up water line", 38420), ("2025-11-03", "Unforeseen asbestos pipe insulation abatement (time extension 12 days)", 64100), ("2026-01-26", "Additional isolation valves on floors 9-14 per Owner request", 21780)], 1):
        emit(f"CUS-HRP-LUMPSUM-CO{i}", f"customers/harborview-capitol-tower_hvac-replacement-construction-contract/{i+1:02d}_change-order-{i}_{d}.md", f"""CHANGE ORDER NO. {i}
Project: Capitol Tower Chiller and Piping Replacement, 1020 J Street, Sacramento, CA
Contract: Construction Contract (Stipulated Sum) dated May 19, 2025 between Harborview Capitol Tower LLC (Owner) and Meridian Mechanical Group, Inc. (Contractor)
Date: {long(d)}
Description: {desc}
Change in Contract Sum: +{money(amt)}
Original Contract Sum: $2,846,000.00
Contract Sum including this Change Order: {money(2846000 + sum(x for _, _, x in [("", "", 38420), ("", "", 64100), ("", "", 21780)][:i]))}
Change in Contract Time: {'12 days' if i == 2 else '0 days'}
Signed: Owner / Contractor
""", doc_type="change_order", parent_id="CUS-HRP-LUMPSUM", counterparty="CUS-HRP", effective_date=d, roles=["lump_sum"],
             cluster="harborview-capitol-tower_hvac-replacement-construction-contract")


# ------------------------------------------------------------------ subcontracts
def subcontracts():
    for i, (d, desc, amt) in enumerate([("2025-09-22", "Added process cooling water branch to Bay 4 per RFI 118", 142800), ("2026-02-16", "Credit for owner-furnished chilled water valves", -36400)], 1):
        emit(f"SUBK-BHC-CO{i}", f"subcontracts/bridgewell-construction_master-subcontract-solara-fab/{i+1:02d}_change-order-{i}_{d}.md", f"""SUBCONTRACT CHANGE ORDER NO. {i}
Contractor: Bridgewell Construction Company     Subcontractor: Meridian Mechanical Group, Inc.
Project: Solara Semiconductor Fab 2 - Mechanical Utilities
Date: {long(d)}
Description: {desc}
Reference: Service Agreement (Subcontract) dated April 14, 2025, Article 7 (Changes)
Adjustment to Subcontract Price: {money(amt)}
Adjustment to Contract Time: none
Pricing basis: labor at the Subcontract's agreed unit rates; materials at documented cost plus 10% overhead and profit.
This Change Order constitutes full compensation for the described change, including all direct and indirect costs and schedule impacts.
All other terms of the Service Agreement remain unchanged.

Contractor: Bridgewell Construction Company, by its Project Executive      Subcontractor: Meridian Mechanical Group, Inc., by its Vice President, Operations
""", doc_type="change_order", parent_id="SUBK-BHC-01", counterparty="GC-BHC", effective_date=d, roles=["flow_down"], cluster="bridgewell-construction_master-subcontract-solara-fab")
    fh = (RAW / "A-FHWA-1273.txt").read_text()
    fh = re.sub(r"\[\[page \d+\]\]", "\n", fh)
    emit("SUBK-TPB-EXC", "subcontracts/titan-peak-builders_subcontract-fm-1960-interchange/02_exhibit-c_form-fhwa-1273-required-contract-provisions.md",
         "EXHIBIT C TO SUBCONTRACT AGREEMENT DATED SEPTEMBER 3, 2024 (FM 1960 INTERCHANGE MAINTENANCE FACILITY)\nForm FHWA-1273, Required Contract Provisions, Federal-Aid Construction Contracts (physically incorporated)\n\n" + fh,
         doc_type="exhibit", parent_id="SUBK-TPB-01", counterparty="GC-TPB", effective_date="2024-09-03", roles=["flow_down", "federal_aid"], source_ref="https://www.fhwa.dot.gov/programadmin/contracts/1273/1273.pdf",
         cluster="titan-peak-builders_subcontract-fm-1960-interchange")
    emit("SUBK-TPB-CO1", "subcontracts/titan-peak-builders_subcontract-fm-1960-interchange/03_change-order-1_2025-06-30.md", f"""SUBCONTRACT CHANGE ORDER NO. 1
Contractor: Titan Peak Builders, Inc.     Subcontractor: Meridian Mechanical of Texas, LLC
Project: FM 1960 Interchange Maintenance Facility (TxDOT, federal-aid)
Date: {long('2025-06-30')}
Description: Add two 100-gallon water heaters and emergency eyewash tempering station per TxDOT field directive FD-22.
Adjustment to Subcontract Price: +$27,640.00 (Revised Subcontract Price: $1,212,140.00)
Subcontractor's request for material price escalation on copper piping dated June 2, 2025 is denied; see Section 4 (Firm Price).
""", doc_type="change_order", parent_id="SUBK-TPB-01", counterparty="GC-TPB", effective_date="2025-06-30", roles=["firm_price", "tariff"],
         cluster="titan-peak-builders_subcontract-fm-1960-interchange")
    emit("SUBK-CRC-REA", "subcontracts/cascade-ridge-contractors_subcontract-puyallup-medical-office/02_request-for-equitable-adjustment_2025-05-12.md",
         letter("2025-05-12", "Meridian Mechanical of Washington, LLC\n3310 South Pine Street, Tacoma, WA 98409", "Cascade Ridge Contractors, LLC\nAttn: Project Manager, Puyallup Medical Office Building",
                "Request for Equitable Adjustment - Material Price Escalation (Subcontract dated March 17, 2025)",
                "Under the Material Price Escalation section of the Subcontract, Meridian requests an equitable adjustment of $61,380 for copper tube, copper fittings and HVAC equipment. Our supplier Lakeshore Waterworks & PVF notified us of a 9% price increase and 4% tariff surcharge by letter dated March 10, 2025 (received March 12, 2025), and Northaire Comfort Systems applied a 6% tariff surcharge effective February 5, 2025. Supporting quotations and invoices are attached. The documented increase exceeds the 8% threshold measured from our February 10, 2025 bid.",
                "Marcus T. Delgado\nVice President, Operations"), doc_type="claim_notice", parent_id="SUBK-CRC-01", counterparty="GC-CRC", effective_date="2025-05-12", roles=["tariff", "notice_deadline"],
         cluster="cascade-ridge-contractors_subcontract-puyallup-medical-office", planted_features=["escalation_request_after_21_day_window"])


# ------------------------------------------------------------------ employment instances
TECH = {"CA": ("EMP-TPL-TECH-CA", "form_technician-employment-agreement_california_rev-2017.md", ["Sacramento", "San Jose", "Fresno"], ("2017-04-03", "2024-11-18"), (29, 49)),
        "WA": ("EMP-TPL-TECH-WA", "form_technician-employment-agreement_washington_rev-2019.md", ["Tacoma", "Spokane"], ("2019-02-04", "2025-12-08"), (31, 60)),
        "IL": ("EMP-TPL-TECH-IL", "form_technician-employment-agreement_illinois_rev-2021.md", ["Elk Grove Village", "Naperville"], ("2021-02-01", "2025-09-15"), (30, 52)),
        "TX": ("EMP-TPL-TECH-TX", "form_technician-employment-agreement_texas_rev-2023.md", ["Houston", "San Antonio", "Dallas"], ("2023-01-16", "2026-08-03"), (26, 46))}
COUNTS = {"CA": 6, "WA": 9, "IL": 8, "TX": 7}
POSITIONS = ["Service Technician II (HVAC)", "Service Plumber", "Installation Technician", "Lead Installation Technician", "Apprentice Plumber", "Commercial HVAC Technician", "Drain Cleaning Technician"]


def fill(tpl, vals):
    for k, v in vals.items(): tpl = tpl.replace(f"[[{k}]]", v)
    return tpl


def employment():
    for st, (tid, fn, cities, (a, b), (lo, hi)) in TECH.items():
        p = DOCS / "employment" / "templates" / fn
        if not p.exists():
            print("  missing template", fn); EXPECTED.extend(f"EMP-TECH-{st}-{i+1:02d}" for i in range(COUNTS[st])); continue
        tpl = p.read_text()
        for i in range(COUNTS[st]):
            r = rng_for("tech", st, i)
            name = fake_person(f"tech-{st}-{i}")
            span = (D(b) - D(a)).days
            sign = D(a) + dt.timedelta(days=int(span * (i + 0.5) / COUNTS[st]) + r.randint(-20, 20))
            sign = min(sign, D(b))
            rate = round(r.uniform(lo, hi) * 4) / 4
            if st == "WA" and i in (3, 7): rate = 61.50  # annualized ~$128k: near/above the WA threshold
            vals = {"EMPLOYEE_NAME": name, "POSITION": r.choice(POSITIONS), "BRANCH_CITY": r.choice(cities), "START_DATE": long(sign + dt.timedelta(days=14)),
                    "HOURLY_RATE": f"${rate:.2f} per hour", "SIGN_DATE": long(sign)}
            txt = fill(tpl, vals)
            slug = name.lower().replace(" ", "-").replace("'", "")
            feats = [f"annualized_earnings:{round(rate*2080)}", f"signed:{sign.isoformat()}", f"state:{st}"]
            if st == "IL" and sign >= D("2025-01-01"): feats.append("il_construction_ban_in_effect_at_signing")
            emit(f"EMP-TECH-{st}-{i+1:02d}", f"employment/signed-agreements/{slug}_technician-employment-agreement_{st.lower()}_{sign.isoformat()}.md", txt,
                 doc_type="employment_agreement", parent_id=tid, effective_date=sign.isoformat(), roles=["noncompete" if st != "CA" else "confidentiality", st.lower()],
                 planted_features=["template_instance"] + feats, employee=name)
    p = DOCS / "employment" / "templates" / "form_training-repayment-agreement_rev-2024.md"
    if p.exists():
        tpl = p.read_text()
        for st, ent, d, prog, cost, comp in [("CA", "Meridian Mechanical Group, Inc.", "2025-09-15", "Manufacturer VRF commissioning certification (Northaire Academy)", "$6,800.00", "2025-10-31"),
                                              ("CA", "Meridian Mechanical Group, Inc.", "2026-02-09", "NATE Core and HVAC Service Specialty certification course", "$3,450.00", "2026-04-10"),
                                              ("WA", "Meridian Mechanical of Washington, LLC", "2025-06-02", "Commercial boiler and hydronics advanced training (40 hours)", "$4,200.00", "2025-07-18"),
                                              ("IL", "Meridian Mechanical of Illinois, LLC", "2025-03-10", "Plumbing apprenticeship year 3 tuition and journeyman exam prep", "$5,900.00", "2025-12-12")]:
            name = fake_person(f"train-{st}-{d}")
            txt = fill(tpl, {"COMPANY_ENTITY": ent, "EMPLOYEE_NAME": name, "TRAINING_PROGRAM": prog, "TRAINING_COST": cost, "COMPLETION_DATE": long(comp), "STATE": {"CA": "California", "WA": "Washington", "IL": "Illinois"}[st], "SIGN_DATE": long(d)})
            feats = ["template_instance", f"signed:{d}", f"state:{st}"]
            if st == "CA": feats.append("ca_ab692_" + ("after_cutoff" if d >= "2026-01-01" else "before_cutoff"))
            emit(f"EMP-TRAIN-{st}-{d}", f"employment/signed-agreements/{name.lower().replace(' ', '-')}_training-repayment-agreement_{st.lower()}_{d}.md", txt,
                 doc_type="training_repayment_agreement", parent_id="EMP-TPL-TRAINING", effective_date=d, roles=["training_repayment", "stay_or_pay", st.lower()], planted_features=feats, employee=name)
    p = DOCS / "vendors" / "form_mutual-nondisclosure-agreement_rev-2022.md"
    if p.exists():
        tpl = p.read_text()
        for cp, ent, purpose, law, d, nohire in [("Great Plains Copper Tube, Inc.", "Meridian Mechanical Group, Inc.", "evaluation of a long-term copper tube supply relationship", "California", "2019-08-05", False),
                                                  ("FieldFlow Software, Inc.", "Meridian Mechanical Group, Inc.", "evaluation of field-service management software", "California", "2021-01-11", False),
                                                  ("Summit Valley Plumbing & Rooter, Inc.", "Meridian Mechanical of Washington, LLC", "evaluation of a potential acquisition of the business of Summit Valley Plumbing & Rooter, Inc.", "Washington", "2026-05-18", True),
                                                  ("First Harbor Bank, N.A.", "Meridian Home Services Holdings, LLC", "evaluation of a senior credit facility", "California", "2021-04-26", False)]:
            txt = fill(tpl, {"MERIDIAN_ENTITY": ent, "COUNTERPARTY": cp, "PURPOSE": purpose, "GOVERNING_LAW": f"the State of {law}", "EFFECTIVE_DATE": long(d)})
            if nohire:
                m = re.search(r"(?im)^.*IN WITNESS WHEREOF", txt)
                ins = "\n" + PLANTS["NDA_NOHIRE"] + "\n\n"
                txt = txt[:m.start()] + ins + txt[m.start():] if m else txt + ins
            slug = re.sub(r"[^a-z0-9]+", "-", cp.lower()).strip("-")
            emit(f"VEN-NDA-{slug[:20]}", f"vendors/{slug}_mutual-nondisclosure-agreement_{d}.md", txt, doc_type="nda", parent_id="VEN-NDA-FORM", effective_date=d,
                 roles=["distractor"] + (["no_hire"] if nohire else []), planted_features=["template_instance"] + (["NDA_NOHIRE"] if nohire else []))


# ------------------------------------------------------------------ corporate
def corporate():
    for holder, d, ref in [("State of Washington, Department of Enterprise Services, Olympia, WA", "2026-07-01", "Master Contract 04224"), ("Harborview Realty Partners, LP and Harborview Capitol Tower LLC", "2026-07-01", "Capitol Tower chiller replacement / Master Facilities Maintenance Services Agreement"),
                           ("Bridgewell Construction Company and Solara Semiconductor Fab 2, LLC", "2026-07-01", "Solara Fab 2 Mechanical Utilities"), ("City of San Marcos Bend, Texas", "2026-07-01", "Annual Job Order Contract - On-Call Plumbing")]:
        slug = re.sub(r"[^a-z0-9]+", "-", holder.split(",")[0].lower()).strip("-")
        emit(f"CORP-COI-{slug[:24]}", f"corporate/certificates-of-insurance/coi_{slug}_{d}.md", f"""CERTIFICATE OF LIABILITY INSURANCE                    Date issued: {long(d)}
THIS CERTIFICATE IS ISSUED AS A MATTER OF INFORMATION ONLY AND CONFERS NO RIGHTS UPON THE CERTIFICATE HOLDER. IT DOES NOT AMEND, EXTEND OR ALTER THE COVERAGE AFFORDED BY THE POLICIES BELOW.

Producer: Alder & Crane Insurance Services, 1 Embarcadero Center, Suite 2600, San Francisco, CA 94111
Insured: Meridian Home Services Holdings, LLC; Meridian Mechanical Group, Inc. and subsidiaries, 2150 Harbor Point Drive, Suite 400, Sacramento, CA 95833

| Type | Insurer | Policy No. | Period | Limits |
|---|---|---|---|---|
| Commercial General Liability (occurrence) | Granite Shield Casualty Company | GSC-CGL-4471902 | 07/01/2026-07/01/2027 | $2,000,000 each occurrence / $4,000,000 aggregate |
| Business Auto | Granite Shield Casualty Company | GSC-BAP-4471903 | 07/01/2026-07/01/2027 | $1,000,000 CSL |
| Umbrella | Harbor Crest Specialty Insurance Company | HCS-UMB-208813 | 07/01/2026-07/01/2027 | $10,000,000 |
| Workers' Compensation / Employers' Liability | Pacific Crest Mutual | PCM-WC-771204 | 07/01/2026-07/01/2027 | Statutory / $1,000,000 |

Description of operations: {ref}. Certificate holder is included as additional insured on the General Liability and Auto policies where required by written contract; coverage is primary and non-contributory and includes waiver of subrogation where required by written contract.
Certificate Holder: {holder}
""", doc_type="certificate_of_insurance", effective_date=d, roles=["insurance", "l2_link"])
    for i, (d, units) in enumerate([("2023-03-01", 38), ("2024-09-16", 44), ("2026-04-06", 26)], 1):
        emit(f"CORP-FLEET-SCH{i}", f"corporate/summit-fleet-leasing_master-equity-lease/{i+2:02d}_vehicle-schedule-{i}_{d}.md", f"""SCHEDULE NO. {i} TO AMENDED AND RESTATED MASTER EQUITY LEASE AGREEMENT
Lessor: Summit Fleet Trust, by Summit Fleet Leasing, LLC       Lessee: Meridian Mechanical Group, Inc.
Schedule date: {long(d)}
Vehicles: {units} Ford Transit 250 high-roof cargo vans with plumbing/HVAC upfit (shelving, ladder racks, copper tube carrier)
Lease term: 60 months per unit; monthly rental per unit $1,184.62 including management fee; reduction percentage 1.65%
Insurance: Lessee shall maintain liability and physical damage insurance naming Lessor as additional insured and loss payee per Section 12 of the Master Equity Lease.
""", doc_type="lease_schedule", parent_id="CORP-FLEET-01", effective_date=d, roles=["distractor"], cluster="summit-fleet-leasing_master-equity-lease")
    emit("CORP-CREDIT-CC-2026Q2", "corporate/first-harbor-bank_credit-agreement/05_compliance-certificate_fiscal-quarter-ended-2026-06-30.md", f"""COMPLIANCE CERTIFICATE
Credit Agreement dated as of July 20, 2021 (as amended) among Meridian Mechanical Group, Inc., as Borrower, the other Loan Parties, and First Harbor Bank, N.A.
Fiscal quarter ended: June 30, 2026            Date: {long('2026-08-12')}

The undersigned Chief Financial Officer certifies that:
1. Fixed Charge Coverage Ratio (trailing four quarters): 1.23:1.00 (minimum required: 1.25:1.00 from January 1, 2026)
2. Total Leverage Ratio: 2.71:1.00 (maximum permitted: 3.00:1.00)
3. Consolidated EBITDA (trailing four quarters): $9,860,000, including $1,140,000 of unrecovered tariff-related material cost increases absorbed on fixed-price customer contracts.
4. Except as disclosed in item 1, no Default or Event of Default has occurred and is continuing. The Borrower is requesting a waiver of the Fixed Charge Coverage Ratio for the quarter ended June 30, 2026.

Priya Ramaswamy, Chief Financial Officer
""", doc_type="compliance_certificate", parent_id="CORP-CREDIT-01", effective_date="2026-08-12", roles=["financial_covenants", "tariff", "l2_link"],
         cluster="first-harbor-bank_credit-agreement", planted_features=["fccr_breach_linked_to_tariff_costs"])


if __name__ == "__main__":
    import json
    from common import BUILD
    supply(); customers(); subcontracts(); employment(); corporate()
    (BUILD / "specs" / "expected_structured.json").write_text(json.dumps(EXPECTED, indent=0))
    print(f"structured documents written: {N}; expected: {len(EXPECTED)}")
