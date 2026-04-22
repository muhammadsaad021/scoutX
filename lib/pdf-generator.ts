import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generatePlayerReportPDF(player: any) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Primary color
  doc.text("ScoutX Player Report", 14, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
  
  // Profile Section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Player Profile", 14, 40);
  
  doc.setFontSize(11);
  const profileData = [
    ["Name", player.Name || "—"],
    ["Position", player.Position || "—"],
    ["Age", player.Age ? `${player.Age} yrs` : "—"],
    ["Club", player.Club || "—"],
    ["Height", player.Height ? `${player.Height} cm` : "—"],
    ["Weight", player.Weight ? `${player.Weight} kg` : "—"],
    ["Scouted By", player.Users?.Name || "—"],
  ];
  
  autoTable(doc, {
    startY: 45,
    body: profileData,
    theme: "plain",
    styles: { cellPadding: 2, fontSize: 11 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
  });

  // Performance Summary
  let currentY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.text("Performance Summary", 14, currentY);
  
  const summaryData = [
    ["Matches Played", player.MatchesPlayed.toString()],
    ["Total Goals", player.TotalGoals.toString()],
    ["Total Assists", player.TotalAssists.toString()],
    ["Average Score", player.AverageScore ? player.AverageScore.toString() : "N/A"],
  ];
  
  autoTable(doc, {
    startY: currentY + 5,
    body: summaryData,
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229] },
  });
  
  // Match History
  if (player.Performances && player.Performances.length > 0) {
    currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text("Match History", 14, currentY);
    
    const historyHead = [["Date", "Goals", "Assists", "Passes", "Rating", "Score"]];
    const historyBody = player.Performances.map((p: any) => [
      new Date(p.MatchDate).toLocaleDateString(),
      p.Goals.toString(),
      p.Assists.toString(),
      p.Passes.toString(),
      p.Rating ? p.Rating.toFixed(1) : "—",
      p.CalculatedScore ? p.CalculatedScore.toFixed(1) : "—",
    ]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: historyHead,
      body: historyBody,
      theme: "grid",
      headStyles: { fillColor: [50, 50, 50] },
    });
  }
  
  // Scout Notes
  if (player.ScoutNotes && player.ScoutNotes.length > 0) {
    currentY = (doc as any).lastAutoTable.finalY + 15;
    // Page break if needed
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(16);
    doc.text("Scout Notes", 14, currentY);
    
    const notesBody = player.ScoutNotes.map((n: any) => [
      `${n.Users?.Name || "Scout"} (${new Date(n.CreatedAt).toLocaleDateString()})\n${n.NoteText}`
    ]);
    
    autoTable(doc, {
      startY: currentY + 5,
      body: notesBody,
      theme: "plain",
      styles: { cellPadding: 4, lineColor: [200, 200, 200], lineWidth: 0.1 },
    });
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `ScoutX Platform — Confidential Report — Page ${i} of ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }
  
  doc.save(`ScoutX_Report_${player.Name.replace(/\s+/g, '_')}.pdf`);
}

export function generateRankingsPDF(rankings: any[], positionFilter: string) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Primary color
  doc.text("ScoutX Player Rankings", 14, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const subtitle = positionFilter 
    ? `Top Players — ${positionFilter} (Generated: ${new Date().toLocaleDateString()})`
    : `Top Players — All Positions (Generated: ${new Date().toLocaleDateString()})`;
  doc.text(subtitle, 14, 28);
  
  const tableHead = [["Rank", "Player", "Position", "Club", "Age", "Matches", "Avg Score"]];
  const tableBody = rankings.map((p: any) => [
    `#${p.Rank}`,
    p.Name,
    p.Position,
    p.Club || "—",
    p.Age ? p.Age.toString() : "—",
    p.MatchesPlayed.toString(),
    p.AverageScore.toString()
  ]);
  
  autoTable(doc, {
    startY: 35,
    head: tableHead,
    body: tableBody,
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 10 },
  });
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `ScoutX Platform — Confidential Rankings — Page ${i} of ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }
  
  doc.save(`ScoutX_Rankings_${positionFilter || "All"}_${new Date().toISOString().split('T')[0]}.pdf`);
}
