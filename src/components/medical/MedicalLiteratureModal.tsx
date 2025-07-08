import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  FileText, 
  Calendar, 
  User, 
  ExternalLink, 
  Download,
  Filter,
  BookOpen,
  TrendingUp,
  Clock,
  Star,
  RefreshCw
} from 'lucide-react';
import Button from '../ui/Button';
import { toast } from 'react-toastify';

interface MedicalArticle {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  publishedDate: string;
  abstract: string;
  doi?: string;
  pmid?: string;
  url?: string;
  keywords: string[];
  citationCount?: number;
  type: 'research' | 'review' | 'case-study' | 'clinical-trial';
  source: 'pubmed' | 'arxiv' | 'crossref';
}

interface MedicalLiteratureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MedicalLiteratureModal: React.FC<MedicalLiteratureModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<MedicalArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'research' | 'review' | 'clinical-trial'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'citations'>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<MedicalArticle | null>(null);

  // PubMed API integration
  const searchPubMed = async (query: string, retmax: number = 20) => {
    try {
      // First, search for article IDs
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${retmax}&retmode=json&sort=relevance`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (!searchData.esearchresult?.idlist?.length) {
        return [];
      }
      
      const ids = searchData.esearchresult.idlist.join(',');
      
      // Then fetch article details
      const detailsUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids}&retmode=json`;
      
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      
      const articles: MedicalArticle[] = [];
      
      for (const id of searchData.esearchresult.idlist) {
        const article = detailsData.result[id];
        if (article) {
          articles.push({
            id: `pubmed_${id}`,
            title: article.title || 'No title available',
            authors: article.authors?.map((author: any) => author.name) || ['Unknown'],
            journal: article.fulljournalname || article.source || 'Unknown Journal',
            publishedDate: article.pubdate || 'Unknown',
            abstract: article.abstract || 'Abstract not available',
            pmid: id,
            doi: article.elocationid?.startsWith('doi:') ? article.elocationid.replace('doi:', '') : undefined,
            url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
            keywords: article.keywords || [],
            type: 'research',
            source: 'pubmed'
          });
        }
      }
      
      return articles;
    } catch (error) {
      console.error('PubMed API error:', error);
      return [];
    }
  };

  // CrossRef API for additional research papers
  const searchCrossRef = async (query: string, rows: number = 10) => {
    try {
      const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${rows}&sort=relevance&order=desc`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.message?.items) {
        return [];
      }
      
      const articles: MedicalArticle[] = data.message.items.map((item: any, index: number) => ({
        id: `crossref_${item.DOI?.replace('/', '_') || index}`,
        title: item.title?.[0] || 'No title available',
        authors: item.author?.map((author: any) => `${author.given || ''} ${author.family || ''}`.trim()) || ['Unknown'],
        journal: item['container-title']?.[0] || 'Unknown Journal',
        publishedDate: item.published?.['date-parts']?.[0]?.join('-') || 'Unknown',
        abstract: item.abstract || 'Abstract not available',
        doi: item.DOI,
        url: item.URL,
        keywords: item.subject || [],
        citationCount: item['is-referenced-by-count'] || 0,
        type: item.type === 'journal-article' ? 'research' : 'review',
        source: 'crossref'
      }));
      
      return articles;
    } catch (error) {
      console.error('CrossRef API error:', error);
      return [];
    }
  };

  // arXiv API for preprints and research papers
  const searchArXiv = async (query: string, maxResults: number = 10) => {
    try {
      const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;
      
      const response = await fetch(url);
      const xmlText = await response.text();
      
      // Parse XML response
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const entries = xmlDoc.getElementsByTagName('entry');
      
      const articles: MedicalArticle[] = [];
      
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const id = entry.getElementsByTagName('id')[0]?.textContent || '';
        const title = entry.getElementsByTagName('title')[0]?.textContent || 'No title';
        const summary = entry.getElementsByTagName('summary')[0]?.textContent || 'No abstract';
        const published = entry.getElementsByTagName('published')[0]?.textContent || '';
        
        const authors: string[] = [];
        const authorElements = entry.getElementsByTagName('author');
        for (let j = 0; j < authorElements.length; j++) {
          const name = authorElements[j].getElementsByTagName('name')[0]?.textContent;
          if (name) authors.push(name);
        }
        
        const categories: string[] = [];
        const categoryElements = entry.getElementsByTagName('category');
        for (let j = 0; j < categoryElements.length; j++) {
          const term = categoryElements[j].getAttribute('term');
          if (term) categories.push(term);
        }
        
        articles.push({
          id: `arxiv_${id.split('/').pop()}`,
          title: title.trim(),
          authors: authors.length > 0 ? authors : ['Unknown'],
          journal: 'arXiv Preprint',
          publishedDate: published.split('T')[0],
          abstract: summary.trim(),
          url: id,
          keywords: categories,
          type: 'research',
          source: 'arxiv'
        });
      }
      
      return articles;
    } catch (error) {
      console.error('arXiv API error:', error);
      return [];
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setArticles([]);
    
    try {
      // Search multiple sources in parallel
      const [pubmedResults, crossrefResults, arxivResults] = await Promise.all([
        searchPubMed(searchQuery, 15),
        searchCrossRef(searchQuery, 10),
        searchArXiv(searchQuery, 5)
      ]);
      
      const allResults = [...pubmedResults, ...crossrefResults, ...arxivResults];
      
      // Remove duplicates based on title similarity
      const uniqueResults = allResults.filter((article, index, self) => 
        index === self.findIndex(a => 
          a.title.toLowerCase().trim() === article.title.toLowerCase().trim()
        )
      );
      
      setArticles(uniqueResults);
      setTotalResults(uniqueResults.length);
      setCurrentPage(1);
      
      if (uniqueResults.length === 0) {
        toast.info('No articles found. Try different keywords.');
      } else {
        toast.success(`Found ${uniqueResults.length} articles`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArticles = selectedFilter === 'all' 
    ? articles 
    : articles.filter(article => article.type === selectedFilter);

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
      case 'citations':
        return (b.citationCount || 0) - (a.citationCount || 0);
      default:
        return 0; // Keep original order for relevance
    }
  });

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getSourceBadge = (source: string) => {
    const badges = {
      pubmed: { color: 'bg-blue-100 text-blue-800', label: 'PubMed' },
      crossref: { color: 'bg-green-100 text-green-800', label: 'CrossRef' },
      arxiv: { color: 'bg-purple-100 text-purple-800', label: 'arXiv' }
    };
    
    const badge = badges[source as keyof typeof badges] || { color: 'bg-gray-100 text-gray-800', label: source };
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center">
            <BookOpen size={24} className="text-primary-500 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Medical Literature Research</h3>
              <p className="text-sm text-gray-500">Search latest medical research and publications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Search medical literature (e.g., COVID-19 treatment, diabetes management, AI diagnosis)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSearch}
              isLoading={isLoading}
              disabled={isLoading}
              leftIcon={isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
            >
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">Filter:</span>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Types</option>
                <option value="research">Research</option>
                <option value="review">Review</option>
                <option value="clinical-trial">Clinical Trial</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <TrendingUp size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="citations">Citations</option>
              </select>
            </div>

            {totalResults > 0 && (
              <div className="text-sm text-gray-500">
                {totalResults} articles found
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw size={48} className="mx-auto text-primary-500 animate-spin mb-4" />
                <p className="text-gray-600">Searching medical literature...</p>
                <p className="text-sm text-gray-500 mt-2">Searching PubMed, CrossRef, and arXiv</p>
              </div>
            </div>
          ) : sortedArticles.length > 0 ? (
            <div className="h-full overflow-y-auto p-6">
              <div className="space-y-4">
                {sortedArticles.map((article) => (
                  <div
                    key={article.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      <div className="flex items-center space-x-2 ml-4">
                        {getSourceBadge(article.source)}
                        {article.citationCount && (
                          <span className="flex items-center text-xs text-gray-500">
                            <Star size={12} className="mr-1" />
                            {article.citationCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <User size={14} className="mr-1" />
                      <span className="mr-4">{article.authors.slice(0, 3).join(', ')}{article.authors.length > 3 ? ' et al.' : ''}</span>
                      <Calendar size={14} className="mr-1" />
                      <span className="mr-4">{formatDate(article.publishedDate)}</span>
                      <FileText size={14} className="mr-1" />
                      <span>{article.journal}</span>
                    </div>

                    <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                      {article.abstract}
                    </p>

                    {article.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {article.keywords.slice(0, 5).map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {article.doi && (
                          <span className="text-xs text-gray-500">DOI: {article.doi}</span>
                        )}
                        {article.pmid && (
                          <span className="text-xs text-gray-500">PMID: {article.pmid}</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<ExternalLink size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (article.url) {
                              window.open(article.url, '_blank');
                            }
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Search Medical Literature</h4>
                <p className="text-gray-600 mb-4">
                  Enter keywords to search across PubMed, CrossRef, and arXiv databases
                </p>
                <div className="text-sm text-gray-500">
                  <p>• PubMed: Biomedical literature database</p>
                  <p>• CrossRef: Academic publications</p>
                  <p>• arXiv: Preprints and research papers</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Article Detail Modal */}
        {selectedArticle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 pr-4">
                    {selectedArticle.title}
                  </h3>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  {getSourceBadge(selectedArticle.source)}
                  <span className="text-sm text-gray-600">
                    {selectedArticle.authors.join(', ')}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatDate(selectedArticle.publishedDate)}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Journal</h4>
                  <p className="text-gray-700">{selectedArticle.journal}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Abstract</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedArticle.abstract}</p>
                </div>

                {selectedArticle.keywords.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    {selectedArticle.doi && <p>DOI: {selectedArticle.doi}</p>}
                    {selectedArticle.pmid && <p>PMID: {selectedArticle.pmid}</p>}
                    {selectedArticle.citationCount && <p>Citations: {selectedArticle.citationCount}</p>}
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedArticle(null)}
                    >
                      Close
                    </Button>
                    <Button
                      variant="primary"
                      leftIcon={<ExternalLink size={16} />}
                      onClick={() => {
                        if (selectedArticle.url) {
                          window.open(selectedArticle.url, '_blank');
                        }
                      }}
                    >
                      Read Full Article
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalLiteratureModal;