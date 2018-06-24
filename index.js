const svg = d3.select('svg')
const width = +svg.attr('width')
const height = +svg.attr('height')

const fader = color => d3.interpolateRgb(color, 'white')(0)
const color = d3.scaleOrdinal(d3.schemeCategory20.map(fader))

// const fontColorContrast = require('font-color-contrast')


const format = d3.format(',d')

const treemap = d3.treemap()
                  .tile(d3.treemapResquarify)
                  .size([width, height])
                  .round(true)
                  .paddingInner(2)

d3.json('db/data.json', (err, data) => {
  if (err) throw err
  
  const root = d3.hierarchy(data)
                 .eachBefore(d => d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name)
                 .sum(sumByHoursTotal)
                 .sort((a, b) => b.height - a.height || b.value - a.value)

  treemap(root)

  const cell = svg.selectAll('g')
                  .data(root.leaves())
                  .enter().append('g')
                  .attr('transform', d => 'translate(' + d.x0 + ',' + d.y0 + ')')
                  
  var tip = d3.tip().attr('class', 'd3-tip').html(d => {
    const percentComplete = Math.round((d.data.hoursComplete/d.data.hoursTotal) * 100)
    return (`
      <h3>${d.data.name}</h3>
      <p>${d.data.description}</p>
      <p>${d.data.reflection}</p>
      <p>% ${percentComplete} complete</p>
    `)})

    console.log(cell.call(tip))
  
  cell.append('a')
      .attr('href', d => d.data.url)
      .attr('target', '_blank')
      .append('rect')
      .attr('id', d => d.data.id)
      .attr('width', d =>  d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => {
        return (
          d.parent.data.color ||
          d.parent.parent.data.color ||
          d.parent.parent.parent.data.color ||
          color(d.parent.data.id)
        )
      })
      .call(tip)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)

  cell.append('clipPath')
      .attr('id', d => 'clip-' + d.data.id)
      .append('use')
      .attr('xlink:href', d => '#' + d.data.id)

  cell.append('text')
      .attr('clip-path', d => 'url(#clip-' + d.data.id + ')')
      .selectAll('tspan')
      .data(d =>  d.data.name.split(/\s/g))
      .enter().append('tspan')
      .attr('x', 8)
      .attr('y', (d, i) => 20 + i * 10)
      .text(d => d)

  cell.append('title')
      .text(d => d.data.id + '\n' + format(d.value))
})

function sumByCount(d) {
  return d.children ? 0 : 1
}

function sumByHoursTotal(d) {
  return d.hoursTotal
}

function sumByHoursRemaining(d) {
  return d.hoursTotal - d.hoursComplete
}

function calculateCompleteness(d) {
  if (d.hoursTotal - d.hoursComplete === 0) return true
  if (d.hoursTotal - d.hoursComplete < 0) throw 'The math is wrong somewhere'
  return false
}

function toggleVisibility() {
  const about = document.getElementById('about')
  about.className = about.className === 'hide' ? 'show' : 'hide'
}