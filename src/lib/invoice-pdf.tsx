import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Invoice } from "@prisma/client";

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  invoiceNumber: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  parties: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  party: {
    width: "45%",
  },
  partyTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 4,
  },
  partyText: {
    marginBottom: 4,
  },
  dateSection: {
    marginBottom: 20,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 8,
    marginBottom: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  colDescription: { width: "50%" },
  colQty: { width: "15%", textAlign: "center" },
  colPrice: { width: "17.5%", textAlign: "right" },
  colTotal: { width: "17.5%", textAlign: "right" },
  totals: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  totalLabel: {
    width: 100,
    textAlign: "right",
    marginRight: 20,
  },
  totalValue: {
    width: 80,
    textAlign: "right",
  },
  totalRowBold: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    fontWeight: "bold",
  },
  vatMention: {
    marginTop: 10,
    fontSize: 9,
    fontStyle: "italic",
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#666",
    textAlign: "center",
  },
});

// Formater les montants
function formatAmount(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " \u20ac";
}

// Formater la date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

interface InvoicePDFProps {
  invoice: Invoice;
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Titre */}
        <Text style={styles.title}>FACTURE</Text>
        <Text style={styles.invoiceNumber}>{invoice.number}</Text>

        {/* Parties */}
        <View style={styles.parties}>
          {/* Émetteur (Coach) */}
          <View style={styles.party}>
            <Text style={styles.partyTitle}>ÉMETTEUR</Text>
            <Text style={styles.partyText}>{invoice.coachLegalName}</Text>
            <Text style={styles.partyText}>SIRET : {invoice.coachSiret}</Text>
            {invoice.coachAddress && (
              <Text style={styles.partyText}>{invoice.coachAddress}</Text>
            )}
          </View>

          {/* Client */}
          <View style={styles.party}>
            <Text style={styles.partyTitle}>CLIENT</Text>
            <Text style={styles.partyText}>{invoice.clientName}</Text>
            <Text style={styles.partyText}>{invoice.clientEmail}</Text>
            {invoice.clientCompany && (
              <Text style={styles.partyText}>{invoice.clientCompany}</Text>
            )}
            {invoice.clientSiret && (
              <Text style={styles.partyText}>SIRET : {invoice.clientSiret}</Text>
            )}
            {invoice.clientAddress && (
              <Text style={styles.partyText}>{invoice.clientAddress}</Text>
            )}
          </View>
        </View>

        {/* Date */}
        <View style={styles.dateSection}>
          <Text>Date d&apos;émission : {formatDate(invoice.issueDate)}</Text>
        </View>

        {/* Tableau */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Désignation</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colPrice}>Prix unitaire</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>

          {/* Row */}
          <View style={styles.tableRow}>
            <Text style={styles.colDescription}>{invoice.description}</Text>
            <Text style={styles.colQty}>{invoice.quantity}</Text>
            <Text style={styles.colPrice}>
              {formatAmount(invoice.unitPriceHT)}
            </Text>
            <Text style={styles.colTotal}>{formatAmount(invoice.amountHT)}</Text>
          </View>
        </View>

        {/* Totaux */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total HT :</Text>
            <Text style={styles.totalValue}>
              {formatAmount(invoice.amountHT)}
            </Text>
          </View>
          <Text style={styles.vatMention}>{invoice.coachVatMention}</Text>
          <View style={styles.totalRowBold}>
            <Text style={styles.totalLabel}>Total TTC :</Text>
            <Text style={styles.totalValue}>
              {formatAmount(invoice.amountTTC)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Facture générée via TrustCoach • {invoice.coachLegalName} • SIRET{" "}
          {invoice.coachSiret}
        </Text>
      </Page>
    </Document>
  );
}
